#!/usr/bin/env bash
#
# Runs on the droplet, over SSH, from .github/workflows/ci.yml. Deploys ONE
# specific image tag — the git commit sha CI just built — rather than the mutable
# `latest`, so two pushes landing close together can never race each other onto
# the wrong image, and `git reset --hard "$NEW_TAG"` puts docker-compose.yml
# itself in lockstep with the image it is running: a commit that adds a required
# env var or a new volume ships both together.
#
# On failure — compose refusing to start, or the app starting but never answering
# its health check — this rolls back to the last tag that passed its own health
# check, so a bad deploy never leaves the site down.
#
# Usage: deploy.sh <git-sha>

set -euo pipefail

# Derived from this script's own location rather than hardcoded a second time.
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE="ghcr.io/be-marvelous-digital/svadobnysalonjarka.sk"
# One deployed (and health-checked) tag per line, oldest first. The source of
# truth for both rollback and pruning — not a record of every pull attempt, only
# of what actually ran successfully.
HISTORY_FILE="$APP_DIR/.deploy_history"
KEEP=5
# Through nginx to the API and on to MongoDB, so a pass means "this deploy can
# actually take a reservation". nginx's own /healthz proves the web container
# started and nothing else, and an API crash-looping on a bad env var sails
# straight through it.
HEALTH_PATH="/api/health"
HEALTH_RETRIES=10
HEALTH_DELAY_S=3

NEW_TAG="${1:?usage: deploy.sh <git-sha>}"

cd "$APP_DIR"

git fetch origin main
git reset --hard "$NEW_TAG"

PREV_TAG=""
if [ -s "$HISTORY_FILE" ]; then
    PREV_TAG="$(tail -n1 "$HISTORY_FILE")"
fi

echo "==> Pulling ${IMAGE}:${NEW_TAG}"
docker pull "${IMAGE}:${NEW_TAG}"

# TAG is read by docker-compose.yml's `image: …:${TAG:-latest}` — exporting it
# here, rather than writing it into the tracked .env, keeps the deployed version a
# property of this script's invocation, never a file someone could leave stale.
bring_up() {
    TAG="$1" docker compose up -d
}

# The host port is compose's to decide (WEB_PORT overrides it), so ask compose
# instead of hardcoding 8080 a second time.
health_url() {
    local mapping port
    mapping="$(docker compose port web 8080 2>/dev/null | tail -n1)"
    port="${mapping##*:}"
    if [ -z "$port" ]; then
        echo "==> Could not read the published port for web; falling back to ${WEB_PORT:-8080}." >&2
        port="${WEB_PORT:-8080}"
    fi
    echo "http://127.0.0.1:${port}${HEALTH_PATH}"
}

wait_for_health() {
    local url
    url="$(health_url)"
    echo "==> Waiting on ${url}"
    for _ in $(seq 1 "$HEALTH_RETRIES"); do
        if curl -fsS "$url" >/dev/null 2>&1; then
            return 0
        fi
        sleep "$HEALTH_DELAY_S"
    done
    return 1
}

rollback_or_die() {
    local reason="$1"
    echo "==> ${reason}"
    docker compose logs api --tail 50 || true

    if [ -z "$PREV_TAG" ] || [ "$PREV_TAG" = "$NEW_TAG" ]; then
        echo "==> No earlier known-good tag to roll back to. Site is left as-is — check manually."
        exit 1
    fi

    echo "==> Rolling back to ${PREV_TAG}"
    # The compose file goes back with the image. Rolling back the image alone
    # would leave the working tree on the failed commit, handing the old image a
    # config it was never built against.
    if ! git reset --hard "$PREV_TAG"; then
        echo "==> Could not check out ${PREV_TAG}; rolling back the image against the current config."
    fi

    if bring_up "$PREV_TAG" && wait_for_health; then
        echo "==> Rollback to ${PREV_TAG} confirmed healthy."
    else
        echo "==> Rollback ALSO failed health checks. Manual intervention needed."
    fi
    exit 1
}

echo "==> Starting ${NEW_TAG}"
# `up -d` succeeding only means the containers started, not that the app inside is
# healthy — a container that crash-loops on a bad env var still "starts" as far as
# compose is concerned.
if ! bring_up "$NEW_TAG"; then
    rollback_or_die "compose up failed for ${NEW_TAG}"
fi

if ! wait_for_health; then
    rollback_or_die "Health check failed for ${NEW_TAG} after ${HEALTH_RETRIES} attempts"
fi

echo "==> ${NEW_TAG} is healthy."
echo "$NEW_TAG" >>"$HISTORY_FILE"

# Keep only the KEEP most recently deployed tags, both in the history file and on
# disk. The registry keeps every image regardless — this is disk hygiene on the
# droplet, not a retention policy.
mapfile -t history <"$HISTORY_FILE"
if [ "${#history[@]}" -gt "$KEEP" ]; then
    keep_tags=("${history[@]: -$KEEP}")
else
    keep_tags=("${history[@]}")
fi
printf '%s\n' "${keep_tags[@]}" >"$HISTORY_FILE"

is_kept() {
    local tag="$1"
    for kept in "${keep_tags[@]}"; do
        [ "$kept" = "$tag" ] && return 0
    done
    return 1
}

while IFS= read -r old_tag; do
    [ -z "$old_tag" ] && continue
    if ! is_kept "$old_tag"; then
        echo "==> Removing old image ${IMAGE}:${old_tag}"
        docker rmi "${IMAGE}:${old_tag}" 2>/dev/null || true
    fi
done < <(docker images "$IMAGE" --format '{{.Tag}}' | sort -u)

docker image prune -f

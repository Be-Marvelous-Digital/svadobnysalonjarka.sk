# syntax=docker/dockerfile:1.7
#
# One image, built once from the whole repo, used for all docker-compose
# services: `api` runs `node dist/index.js`, `site` runs `node web/server.js`
# (Next.js) and `web` runs `nginx -g daemon off;` in front of both.

# --- web build --------------------------------------------------------------
FROM node:22-alpine AS web-build

WORKDIR /app/web

COPY web/package.json web/package-lock.json* ./
RUN npm ci

COPY web/tsconfig.json web/next.config.ts ./
COPY web/public ./public
COPY web/src ./src

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- backend build ----------------------------------------------------------
FROM node:22-alpine AS backend-build

WORKDIR /app/backend

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci

COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# Drop dev dependencies from the tree we are about to copy forward.
RUN npm prune --omit=dev

# --- runtime ----------------------------------------------------------------
FROM node:22-alpine AS runtime

ENV NODE_ENV=production
ENV TZ=Europe/Bratislava

# dumb-init reaps zombies and forwards signals for whichever process this
# container ends up running, node or nginx.
RUN apk add --no-cache dumb-init nginx

WORKDIR /app

COPY --from=backend-build --chown=node:node /app/backend/node_modules ./node_modules
COPY --from=backend-build --chown=node:node /app/backend/dist ./dist
COPY --chown=node:node backend/package.json ./

COPY web/nginx/default.conf /etc/nginx/http.d/default.conf
# Deliberately NOT in http.d/, which alpine's nginx.conf glob-includes: this file
# is a bare list of add_header directives pulled into specific locations, not a
# standalone config.
COPY web/nginx/security-headers.conf /etc/nginx/security-headers.conf

# Next standalone server; nginx serves its static and public files straight from here.
COPY --from=web-build --chown=node:node /app/web/.next/standalone ./web
COPY --from=web-build --chown=node:node /app/web/.next/static ./web/.next/static
COPY --from=web-build --chown=node:node /app/web/public ./web/public

# Gallery uploads. A volume normally covers this, but creating it here means the
# api role also works without one — must be writable by the node user.
RUN mkdir -p /var/lib/jarka/uploads /var/cache/nginx /var/log/nginx \
    && chown -R node:node /var/lib/jarka \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx

EXPOSE 3000 4000 8080

ENTRYPOINT ["dumb-init", "--"]
# Overridden per-service in docker-compose.yml (`command:` + `user:`).
CMD ["node", "dist/index.js"]

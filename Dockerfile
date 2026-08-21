# syntax=docker/dockerfile:1.7
#
# One image, built once from the whole repo, used for both docker-compose
# services. `api` runs it as `node dist/index.js`, `web` runs the same image as
# `nginx -g daemon off;` — one process per container, only the build artifact is
# unified.

# --- frontend build ---------------------------------------------------------
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# sitemap.plugin.ts is referenced by both vite.config.ts and tsconfig.node.json,
# so leaving it out fails the build at `tsc -b`, not at runtime.
COPY frontend/tsconfig*.json frontend/vite.config.ts frontend/sitemap.plugin.ts frontend/index.html ./
COPY frontend/public ./public
COPY frontend/src ./src

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

COPY frontend/nginx.conf /etc/nginx/http.d/default.conf
# Deliberately NOT in http.d/, which alpine's nginx.conf glob-includes: this file
# is a bare list of add_header directives pulled into specific locations, not a
# standalone config.
COPY frontend/security-headers.conf /etc/nginx/security-headers.conf
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Gallery uploads. A volume normally covers this, but creating it here means the
# api role also works without one — must be writable by the node user.
RUN mkdir -p /var/lib/jarka/uploads /var/cache/nginx /var/log/nginx \
    && chown -R node:node /var/lib/jarka \
    && chown -R nginx:nginx /usr/share/nginx/html \
    && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid \
    && chown -R nginx:nginx /var/cache/nginx /var/log/nginx

EXPOSE 4000 8080

ENTRYPOINT ["dumb-init", "--"]
# Overridden per-service in docker-compose.yml (`command:` + `user:`).
CMD ["node", "dist/index.js"]

# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=24
ARG PNPM_VERSION=11.0.8

################################################################################
# Base image: Node + pnpm, activated via corepack.
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /usr/src/app

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

################################################################################
# Production-only dependencies layer.
# Cached separately: source changes don't invalidate this layer.
# pnpm-workspace.yaml MUST be bind-mounted — it holds the allowBuilds whitelist.
FROM base AS prod-deps

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

################################################################################
# Build stage: all dependencies (incl. dev) + TS compilation.
FROM base AS build

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=pnpm-workspace.yaml,target=pnpm-workspace.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

################################################################################
# Minimal runtime image.
FROM base AS final

ENV NODE_ENV=production

RUN mkdir -p /usr/src/app/db /usr/src/app/logs \
    && chown -R node:node /usr/src/app

USER node

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build    /usr/src/app/dist         ./dist

CMD ["pnpm", "start"]

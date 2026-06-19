FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
ENV NODE_ENV=development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/assistant/package.json apps/assistant/
COPY packages/typescript-config/package.json packages/typescript-config/
RUN pnpm install --filter assistant --frozen-lockfile

FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY apps/assistant/package.json apps/assistant/tsconfig.json apps/assistant/
COPY apps/assistant/src apps/assistant/src
COPY packages/typescript-config packages/typescript-config
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/assistant/node_modules ./apps/assistant/node_modules
RUN pnpm --filter assistant build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/assistant/node_modules ./apps/assistant/node_modules
COPY --from=build /app/apps/assistant/dist ./apps/assistant/dist
COPY --from=build /app/apps/assistant/package.json ./apps/assistant/package.json
COPY apps/assistant/src/db/schema.sql ./apps/assistant/dist/db/schema.sql
COPY apps/blog/content/posts ./blog-content/posts

WORKDIR /app/apps/assistant
EXPOSE 4001
CMD ["node", "dist/index.js"]

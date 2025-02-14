FROM node:20-slim AS base

RUN npm install -g corepack@latest

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy source code
COPY . /app

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production stage
FROM base
WORKDIR /app

# Copy built assets from builder
COPY --from=deps /app/node_modules /app/node_modules
COPY --from=build /app/build ./build
COPY --from=build /app/public ./public
COPY --from=build /app/package.json .

ENV NODE_ENV=production
ENV PORT=5173

EXPOSE 5173

CMD ["pnpm", "start"]

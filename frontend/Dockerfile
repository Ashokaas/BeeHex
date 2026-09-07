FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS release
ENV NODE_ENV=production
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/next.config.mjs ./next.config.mjs

USER bun
EXPOSE 3000/tcp
ENTRYPOINT ["bun", "run", "start"]

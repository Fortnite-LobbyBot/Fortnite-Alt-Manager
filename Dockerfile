# Builder
FROM docker.io/oven/bun:alpine
WORKDIR /bot/

COPY . ./

RUN bun install --production --frozen-lockfile --ignore-scripts

CMD ["bun", "run", "start"]

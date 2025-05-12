# Builder
FROM docker.io/imbios/bun-node:1.1-21-alpine
WORKDIR /bot/

COPY . ./

RUN bun install --production --frozen-lockfile --ignore-scripts

CMD ["bun", "run", "start"]
# Builder
FROM docker.io/imbios/bun-node:1.0-21-alpine AS builder
WORKDIR /build/

COPY . ./

RUN bun install --production --frozen-lockfile --ignore-scripts
RUN bun run build:standalone

# Runner
FROM gcr.io/distroless/base-nossl-debian12:nonroot AS runner

COPY --from=builder /build/dist/bot ./

ENV PORT=4000

EXPOSE 4000/tcp

CMD ["./bot"]
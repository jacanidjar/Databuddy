FROM oven/bun AS build

WORKDIR /app

# Cache packages installation
COPY package.json package.json
COPY apps/basket/package.json ./apps/basket/package.json
COPY packages/*/package.json ./packages/

COPY packages/ ./packages/

RUN bun install

COPY apps/basket/src ./apps/basket/src
COPY apps/basket/maxmind ./maxmind

ENV NODE_ENV=production

RUN bun build \
	--compile \
	--minify-whitespace \
	--minify-syntax \
	--target bun \
	--outfile server \
    --sourcemap \
    --bytecode \
	./apps/basket/src/index.ts

FROM gcr.io/distroless/base

WORKDIR /app

COPY --from=build /app/server server

ENV NODE_ENV=production

CMD ["./server"]

EXPOSE 4000
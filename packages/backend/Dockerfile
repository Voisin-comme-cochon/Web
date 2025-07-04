# Étape 1 : build avec Node
FROM node:20.11-alpine3.19 AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

# Étape 2 : image de production
FROM node:20.11-alpine3.19

WORKDIR /app

COPY --from=builder /app /app

CMD ["pnpm", "run", "start:prod"]

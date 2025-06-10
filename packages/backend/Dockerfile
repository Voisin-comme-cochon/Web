FROM node:20.11-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm i --silent

COPY . .

RUN npm run build

FROM node:20.11-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm i --only=production --silent && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main"]

# Étape 1 : build avec Node
FROM node:20.11 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Étape 2 : image de production
FROM node:20.11

WORKDIR /app
COPY --from=builder /app /app
RUN npm install --omit=dev

CMD ["npm", "run", "start:prod"]

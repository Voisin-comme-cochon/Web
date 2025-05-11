# 1) Stage de build
FROM node:20.11 AS build
WORKDIR /app

# 1.a) On copie seulement les package.json pour maximiser le cache
COPY back-office/package*.json back-office/
COPY common/package*.json common/

# 1.b) On installe les deps du back-office (common sera résolu en file:../common)
WORKDIR /app/back-office
RUN npm install

# 1.c) On copie tout le code (common & back-office)
WORKDIR /app
COPY common common
COPY back-office back-office

# 1.d) On build
WORKDIR /app/back-office
RUN npm run build

# 2) Stage de production
FROM nginx:alpine AS prod
# on récupère le dist généré
COPY --from=build /app/back-office/dist /usr/share/nginx/html
# on place ta conf
COPY back-office/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

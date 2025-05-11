# --- 1) Installer les libs racine (npm workspaces ou pas) ---
FROM node:20.11 AS deps
WORKDIR /app
# Si tu utilises npm workspaces : copie le package.json racine + lockfile
COPY package*.json pnpm-lock.yaml* ./
RUN npm install

# --- 2) Builder le back-office ---
FROM deps AS build
# Place-toi dans le dossier back-office
WORKDIR /app/packages/back-office

# Copie d'abord son package.json pour installer ses deps seules (optionnel si workspaces)
COPY packages/back-office/package*.json ./
RUN npm install

# Ensuite on copie le code et le dossier common
COPY common /app/common
COPY packages/back-office ./

# Build TS + Vite
RUN npm run build

# --- 3) Serve via nginx ---
FROM nginx:alpine AS prod
# On récupère le dist de back-office
COPY --from=build /app/packages/back-office/dist /usr/share/nginx/html
COPY packages/back-office/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

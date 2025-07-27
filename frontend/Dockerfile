# Étape 1 - build de l'app
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Étape 2 - serveur statique (nginx)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie config nginx custom si besoin
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM node:18-alpine

# Installer les dépendances système pour PDFKit
RUN apk add --no-cache \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --production

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 3001

# Démarrer l'application
CMD ["npm", "start"]
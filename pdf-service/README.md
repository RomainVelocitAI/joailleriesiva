# Service PDF Premium Siva Créations

Service autonome utilisant PDFKit pour générer des PDFs de haute qualité avec design premium.

## 🚀 Test en Local

### 1. Installation des dépendances
```bash
cd pdf-service
npm install
```

### 2. Démarrage du service
```bash
# Mode développement avec rechargement automatique
npm run dev

# Ou mode production
npm start
```

Le service sera accessible sur `http://localhost:3001`

### 3. Test du health check
```bash
curl http://localhost:3001/health
```

### 4. Test de génération PDF
```bash
curl -X POST http://localhost:3001/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "client": "Test Client",
    "email": "test@example.com", 
    "demande": "Une bague en or avec diamant",
    "selectedImage": {
      "url": "https://example.com/image.jpg",
      "index": 0
    },
    "otherImages": [],
    "orderId": "test-123"
  }' \
  --output test.pdf
```

## 🐳 Déploiement VPS avec Docker + Traefik

### 1. Configuration du domaine
Modifiez dans `docker-compose.yml` :
```yaml
- "traefik.http.routers.siva-pdf.rule=Host(\`pdf.votre-domaine.com\`)"
```

Remplacez `pdf.votre-domaine.com` par votre sous-domaine.

### 2. Réseau Traefik
Assurez-vous que le réseau Traefik existe :
```bash
docker network create traefik
```

### 3. Build et déploiement
```bash
# Build de l'image
docker-compose build

# Démarrage du service
docker-compose up -d

# Vérification des logs
docker-compose logs -f
```

### 4. Configuration DNS
Pointez votre sous-domaine vers l'IP de votre VPS :
```
pdf.votre-domaine.com A 1.2.3.4
```

## 🔧 Variables d'environnement Next.js

Ajoutez dans votre fichier `.env.local` de Next.js :

```bash
# Local (pour test)
PDF_SERVICE_URL=http://localhost:3001

# Production (VPS)
PDF_SERVICE_URL=https://pdf.votre-domaine.com
```

## 📋 Configuration Traefik type

Si vous n'avez pas encore Traefik configuré, voici un exemple basique :

### docker-compose.traefik.yml
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=votre@email.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
    networks:
      - traefik
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.dashboard.rule=Host(\`traefik.votre-domaine.com\`)"
      - "traefik.http.routers.dashboard.tls=true"
      - "traefik.http.routers.dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.routers.dashboard.service=api@internal"

networks:
  traefik:
    external: true
```

## 🎨 Fonctionnalités du PDF

- **Design premium** avec dégradés dorés et effets visuels
- **Chargement automatique des images** depuis les URLs
- **Typographie élégante** avec hiérarchie claire
- **Mise en page professionnelle** digne d'une joaillerie haut de gamme
- **Encadrés et ombres** pour un effet de profondeur
- **Motifs décoratifs** et éléments graphiques sophistiqués

## 🔄 Workflow complet

1. **Next.js** reçoit la demande de PDF
2. **Appel HTTP** vers le service PDF (local ou VPS)
3. **PDFKit** génère le PDF premium avec les vraies images
4. **Retour** du PDF vers Next.js
5. **Téléchargement** automatique côté client

Cette architecture hybride vous donne le meilleur des deux mondes : la compatibilité serverless de Next.js + la puissance de PDFKit pour des PDFs vraiment premium ! 🎯
# Siva Créations - SaaS Joaillerie Haut de Gamme

Application Next.js pour transformer les demandes sur-mesure en propositions visuelles via n8n, OpenAI Image, et Airtable.

## 🚀 Fonctionnalités

- **Formulaire Premium** : Capture détaillée des besoins clients
- **Génération IA** : 4 propositions visuelles automatiques
- **Édition Interactive** : Personnalisation en temps réel des créations
- **Gestion PDF** : Génération automatique de propositions commerciales
- **Historique Complet** : Suivi de toutes les commandes et statuts
- **Design Dark Premium** : Interface élégante avec accents violets

## 🛠️ Stack Technique

- **Frontend** : Next.js 15, React 19, TypeScript
- **UI** : Tailwind CSS 4, ShadCN UI, Framer Motion
- **Backend** : API Routes Next.js, Webhooks n8n
- **Base de données** : Airtable
- **IA** : OpenAI Image Generation via n8n
- **PDF** : PDFKit via n8n

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos clés

# Lancer en développement
npm run dev

# Lancer avec mock data
npm run mock
```

## ⚙️ Configuration

### Variables d'environnement (.env.local)

```env
# Airtable
AIRTABLE_API_KEY=votre_clé_api
AIRTABLE_BASE_ID=votre_base_id
AIRTABLE_TABLE_NAME=votre_table_name

# n8n Webhooks
WEBHOOK_IMAGE_GENERATION=https://votre-n8n.com/webhook/image-gen
WEBHOOK_IMAGE_EDIT=https://votre-n8n.com/webhook/image-edit
WEBHOOK_PDF_GENERATION=https://votre-n8n.com/webhook/pdf-gen
WEBHOOK_SEND_PROPOSAL=https://votre-n8n.com/webhook/send-proposal

# App
NEXT_PUBLIC_APP_NAME="Siva Créations"
```

### Structure Airtable

Votre table Airtable doit contenir ces colonnes :

| Colonne | Type | Description |
|---------|------|-------------|
| Client | Texte | Nom du client |
| Demande | Texte long | Détail de la demande |
| Image 1-4 | Fichier image | Propositions IA |
| Image collection | Fichier image | Images supplémentaires |
| PDF | Fichier PDF | Proposition finale |

## 🎯 Utilisation

### Parcours Client

1. **Formulaire** : Saisie des informations et préférences
2. **Génération** : 4 propositions créées automatiquement
3. **Sélection** : Choix et personnalisation d'une proposition
4. **Finalisation** : Génération du PDF commercial

### Pages Principales

- `/` : Formulaire et workflow principal
- `/historique` : Gestion des commandes

## 🔧 Développement

### Scripts Disponibles

```bash
npm run dev      # Développement standard
npm run mock     # Mode avec données fictives
npm run build    # Build de production
npm run lint     # Vérification ESLint
```

### Structure du Projet

```
src/
├── app/                 # Pages Next.js
├── components/          # Composants React
├── lib/                # Utilitaires
└── mocks/              # Données de test
```

## 🚀 Déploiement

```bash
npm run build
npm start
```

## 📈 Roadmap

### Phase 2
- Authentification multi-boutiques
- Dashboard analytics
- Quota images par boutique

## 📄 Licence

Propriétaire - Siva Créations

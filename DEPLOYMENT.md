# 🚀 Guide de Déploiement Netlify

## 📋 Prérequis

1. **Compte GitHub** avec votre repo
2. **Compte Netlify** connecté à GitHub
3. **Variables d'environnement** configurées

## 🔧 Étapes de Déploiement

### 1. Créer le Repo GitHub

```bash
# Initialiser git (dans le dossier joaillerie-siva)
git init
git add .
git commit -m "Initial commit - SaaS Joaillerie Siva"

# Connecter à votre repo GitHub
git remote add origin https://github.com/VOTRE-USERNAME/joaillerie-siva.git
git branch -M main
git push -u origin main
```

### 2. Configurer Netlify

1. **Connecter le repo** :
   - Aller sur [netlify.com](https://netlify.com)
   - "New site from Git" → GitHub → Sélectionner votre repo

2. **Configuration build** :
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `20.x`

3. **Variables d'environnement** (OBLIGATOIRE) :
   Aller dans "Site settings" → "Environment variables" et ajouter :

   ```
   AIRTABLE_API_KEY=patpLy8DRoAb4GsVc.9dc0e0a9b48960eefb0b876118d89f5154027f3f01a0a1587039f97ba9655743
   AIRTABLE_BASE_ID=appXBgsSjbSGjAGqA
   AIRTABLE_TABLE_NAME=tblgQnzd2bGvv0BDT
   WEBHOOK_IMAGE_GENERATION=https://n8n.srv765302.hstgr.cloud/webhook/ca263120-71f4-43bc-ba90-52d62505f191
   WEBHOOK_IMAGE_EDIT=https://n8n.srv765302.hstgr.cloud/webhook/2eb6ef35-c798-4e59-a896-5d0d55b57419
   WEBHOOK_PDF_GENERATION=https://n8n.srv765302.hstgr.cloud/webhook/bed499d8-2dda-4d1a-a50d-e1172bec187d
   WEBHOOK_SEND_PROPOSAL=https://n8n.srv765302.hstgr.cloud/webhook/0ab86e41-eedb-4885-ac43-ca9ee5a107f2
   NEXT_PUBLIC_APP_NAME=Siva Créations
   ```

### 3. Déployer

Une fois configuré, Netlify déploiera automatiquement à chaque push sur `main`.

## ✅ Vérifications Post-Déploiement

1. **Test du formulaire** → doit créer une entrée Airtable
2. **Test des webhooks** → doit déclencher n8n
3. **Banner de dev** → ne doit PAS apparaître en production
4. **Page historique** → doit afficher les vraies données Airtable

## 🔍 Debug en Production

- **Logs Netlify** : Functions → View functions logs
- **Console browser** : F12 → Network pour voir les appels API
- **Airtable** : Vérifier la création des records
- **n8n** : Vérifier l'exécution des workflows

## 🛠️ Commandes Utiles

```bash
# Test build local (avant push)
npm run build

# Mode production local
npm start

# Vérifier les variables d'env
env | grep -E "(AIRTABLE|WEBHOOK)"
```

---

**Une fois déployé, votre app sera en mode PRODUCTION et utilisera les vraies intégrations !** 🎉
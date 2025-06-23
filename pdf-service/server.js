const express = require('express');
const PDFDocument = require('pdfkit');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configuration des couleurs premium
const COLORS = {
  primary: '#1a1a1a',
  gold: '#D4AF37',
  lightGold: '#F4E8B8',
  darkGold: '#B8860B',
  white: '#FFFFFF',
  gray: '#666666',
  lightGray: '#F5F5F5',
  black: '#000000'
};

// Fonction pour télécharger une image
async function downloadImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Erreur téléchargement image:', error.message);
    return null;
  }
}

// Fonction pour ajouter la page de couverture
function addCoverPage(doc, data) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const centerX = pageWidth / 2;

  // Background dégradé doré
  const gradient = doc.linearGradient(0, 0, 0, 200);
  gradient.stop(0, COLORS.lightGold);
  gradient.stop(0.5, COLORS.gold);
  gradient.stop(1, COLORS.darkGold);
  
  doc.rect(0, 0, pageWidth, 200).fill(gradient);

  // Motif décoratif en arrière-plan
  doc.save();
  doc.opacity(0.1);
  for (let i = 0; i < 10; i++) {
    const x = (i * pageWidth) / 10;
    doc.moveTo(x, 0)
       .lineTo(x + 100, 200)
       .stroke(COLORS.white);
  }
  doc.restore();

  // Logo/Titre principal avec ombre
  doc.save();
  doc.fillColor(COLORS.black)
     .fontSize(42)
     .font('Helvetica-Bold')
     .text('SIVA CRÉATIONS', centerX + 2, 92, { align: 'center' });
  
  doc.fillColor(COLORS.white)
     .text('SIVA CRÉATIONS', centerX, 90, { align: 'center' });
  doc.restore();

  // Sous-titre avec style délicat
  doc.fillColor(COLORS.white)
     .fontSize(18)
     .font('Helvetica')
     .text('J O A I L L E R I E   D \' E X C E P T I O N', centerX, 130, { 
       align: 'center',
       characterSpacing: 3
     });

  // Ligne dorée décorative
  const lineY = 180;
  doc.moveTo(centerX - 150, lineY)
     .lineTo(centerX - 50, lineY)
     .moveTo(centerX + 50, lineY)
     .lineTo(centerX + 150, lineY)
     .strokeColor(COLORS.white)
     .lineWidth(3)
     .stroke();

  // Diamant central stylisé
  doc.save();
  doc.translate(centerX, lineY);
  doc.moveTo(-15, 0)
     .lineTo(0, -10)
     .lineTo(15, 0)
     .lineTo(0, 10)
     .closePath()
     .fillAndStroke(COLORS.white, COLORS.darkGold);
  doc.restore();

  // Titre principal de la proposition
  doc.fillColor(COLORS.primary)
     .fontSize(32)
     .font('Helvetica-Bold')
     .text('PROPOSITION PERSONNALISÉE', 50, 280, { 
       align: 'center',
       width: pageWidth - 100
     });

  // Nom du client avec encadré doré
  const clientY = 340;
  doc.fontSize(24);
  const clientTextWidth = doc.widthOfString(data.client);
  const paddingX = 35;
  const paddingY = 18;
  
  doc.roundedRect(
    centerX - (clientTextWidth / 2) - paddingX, 
    clientY - paddingY, 
    clientTextWidth + (paddingX * 2), 
    50, 
    12
  )
  .strokeColor(COLORS.gold)
  .lineWidth(3)
  .stroke();

  doc.fillColor(COLORS.gold)
     .fontSize(24)
     .font('Helvetica-Bold')
     .text(data.client, centerX, clientY, { align: 'center' });

  // Citation inspirante avec style italic
  doc.fillColor(COLORS.gray)
     .fontSize(16)
     .font('Helvetica-Oblique')
     .text(
       '"Un bijou n\'est pas seulement un accessoire,\nc\'est l\'expression de votre unicité"',
       centerX,
       450,
       { align: 'center', lineGap: 4 }
     );

  // Date avec style élégant
  const date = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  doc.fillColor(COLORS.gray)
     .fontSize(14)
     .font('Helvetica')
     .text(date, centerX, 520, { align: 'center' });

  // Footer avec motif décoratif
  const footerGradient = doc.linearGradient(0, pageHeight - 120, 0, pageHeight);
  footerGradient.stop(0, COLORS.lightGold);
  footerGradient.stop(1, COLORS.gold);
  
  doc.rect(0, pageHeight - 120, pageWidth, 120).fill(footerGradient);

  // Motifs décoratifs dans le footer
  doc.save();
  doc.opacity(0.4);
  for (let i = 0; i < 6; i++) {
    const x = (i * pageWidth) / 6 + pageWidth / 12;
    const y = pageHeight - 60;
    doc.circle(x, y, 18)
       .fillAndStroke(COLORS.white, COLORS.darkGold);
  }
  doc.restore();
}

// Fonction pour ajouter la page projet
function addProjectPage(doc, data) {
  let y = 80;

  // En-tête avec ligne décorative
  doc.fillColor(COLORS.primary)
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('VOTRE VISION, NOTRE SAVOIR-FAIRE', 50, y);

  y += 45;

  // Ligne décorative avec dégradé
  const lineGradient = doc.linearGradient(50, y, doc.page.width - 50, y);
  lineGradient.stop(0, COLORS.gold);
  lineGradient.stop(0.5, COLORS.darkGold);
  lineGradient.stop(1, COLORS.gold);
  
  doc.moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .strokeColor(lineGradient)
     .lineWidth(4)
     .stroke();

  y += 45;

  // Salutation personnalisée
  doc.fillColor(COLORS.gold)
     .fontSize(20)
     .font('Helvetica-Bold')
     .text(`Cher(e) ${data.client},`, 50, y);

  y += 35;

  // Texte d'introduction avec style premium
  const introText = `Nous avons l'honneur de vous présenter une création unique, spécialement conçue selon vos désirs.

Chez Siva Créations, chaque bijou raconte une histoire - la vôtre. Notre équipe d'artisans joailliers a minutieusement étudié votre demande pour concevoir des propositions qui incarnent parfaitement votre vision.

Cette proposition représente l'union parfaite entre tradition joaillière française et innovation contemporaine, pour un résultat à la hauteur de vos attentes les plus exigeantes.`;

  doc.fillColor(COLORS.primary)
     .fontSize(14)
     .font('Helvetica')
     .text(introText, 50, y, { 
       width: doc.page.width - 100,
       lineGap: 6
     });

  y += 160;

  // Section demande avec encadré élégant
  doc.fillColor(COLORS.gold)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('VOTRE DEMANDE :', 50, y);

  y += 30;

  // Encadré avec ombre pour la demande
  const boxHeight = 90;
  
  // Ombre
  doc.save();
  doc.opacity(0.25);
  doc.roundedRect(55, y + 5, doc.page.width - 110, boxHeight, 10)
     .fill(COLORS.gray);
  doc.restore();

  // Encadré principal
  doc.roundedRect(50, y, doc.page.width - 100, boxHeight, 10)
     .fillAndStroke(COLORS.lightGray, COLORS.gold);

  // Texte de la demande
  doc.fillColor(COLORS.primary)
     .fontSize(14)
     .font('Helvetica-Oblique')
     .text(`"${data.demande}"`, 60, y + 20, { 
       width: doc.page.width - 120,
       lineGap: 5
     });

  y += boxHeight + 45;

  // Engagement qualité avec puces stylisées
  doc.fillColor(COLORS.gold)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('NOTRE ENGAGEMENT :', 50, y);

  y += 30;

  const engagements = [
    'Matériaux nobles sélectionnés avec soin',
    'Artisanat français d\'excellence',
    'Création unique selon vos spécifications', 
    'Garantie à vie sur nos créations',
    'Service après-vente personnalisé'
  ];

  engagements.forEach(engagement => {
    // Puce dorée stylisée
    doc.circle(65, y + 8, 4)
       .fill(COLORS.gold);

    doc.fillColor(COLORS.primary)
       .fontSize(14)
       .font('Helvetica')
       .text(engagement, 80, y);
    
    y += 22;
  });
}

// Fonction pour ajouter la page image principale
async function addMainImagePage(doc, data) {
  let y = 80;

  // Titre avec effet
  doc.fillColor(COLORS.primary)
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('VOTRE CRÉATION SÉLECTIONNÉE', 50, y);

  y += 45;

  // Ligne décorative
  const centerX = doc.page.width / 2;
  doc.moveTo(50, y)
     .lineTo(centerX - 25, y)
     .moveTo(centerX + 25, y) 
     .lineTo(doc.page.width - 50, y)
     .strokeColor(COLORS.gold)
     .lineWidth(3)
     .stroke();

  // Diamant central
  doc.save();
  doc.translate(centerX, y);
  doc.moveTo(-12, 0)
     .lineTo(0, -8)
     .lineTo(12, 0)
     .lineTo(0, 8)
     .closePath()
     .fillAndStroke(COLORS.gold, COLORS.darkGold);
  doc.restore();

  y += 50;

  // Cadre décoratif pour l'image
  const imageSize = 250;
  const imageX = centerX - imageSize / 2;
  
  // Ombre du cadre
  doc.save();
  doc.opacity(0.4);
  doc.roundedRect(imageX + 8, y + 8, imageSize, imageSize, 20)
     .fill(COLORS.gray);
  doc.restore();

  // Cadre doré avec dégradé
  const frameGradient = doc.radialGradient(centerX, y + imageSize/2, 0, centerX, y + imageSize/2, imageSize);
  frameGradient.stop(0, COLORS.lightGold);
  frameGradient.stop(1, COLORS.gold);
  
  doc.roundedRect(imageX - 15, y - 15, imageSize + 30, imageSize + 30, 20)
     .fill(frameGradient);

  // Zone image
  doc.roundedRect(imageX, y, imageSize, imageSize, 15)
     .fillAndStroke(COLORS.white, COLORS.darkGold);

  // Essayer de charger l'image réelle
  if (data.selectedImage.url) {
    try {
      const imageBuffer = await downloadImage(data.selectedImage.url);
      if (imageBuffer) {
        doc.image(imageBuffer, imageX + 10, y + 10, { 
          width: imageSize - 20, 
          height: imageSize - 20,
          fit: [imageSize - 20, imageSize - 20]
        });
      } else {
        // Fallback vers placeholder
        doc.fillColor(COLORS.gray)
           .fontSize(16)
           .font('Helvetica-Oblique')
           .text('Image sélectionnée', centerX, y + imageSize/2 - 20, { align: 'center' })
           .text(`Proposition ${data.selectedImage.index + 1}`, centerX, y + imageSize/2 + 10, { align: 'center' });
      }
    } catch (error) {
      // Placeholder en cas d'erreur
      doc.fillColor(COLORS.gray)
         .fontSize(16)
         .font('Helvetica-Oblique')
         .text('Image sélectionnée', centerX, y + imageSize/2 - 20, { align: 'center' })
         .text(`Proposition ${data.selectedImage.index + 1}`, centerX, y + imageSize/2 + 10, { align: 'center' });
    }
  }

  y += imageSize + 60;

  // Description émotionnelle avec style premium
  doc.fillColor(COLORS.gold)
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('UNE CRÉATION QUI VOUS RESSEMBLE', 50, y);

  y += 35;

  const description = `Cette création incarne parfaitement l'essence de votre demande. Chaque détail a été pensé pour refléter votre personnalité unique et vos aspirations.

Les lignes élégantes et l'harmonie des proportions créent une pièce d'exception qui saura vous accompagner dans tous vos moments précieux.

Cette réalisation représente l'union parfaite entre tradition joaillière et innovation contemporaine, créant une œuvre d'art portable qui transcende les tendances.`;

  doc.fillColor(COLORS.primary)
     .fontSize(14)
     .font('Helvetica')
     .text(description, 50, y, { 
       width: doc.page.width - 100,
       lineGap: 6
     });
}

// Route pour générer le PDF
app.post('/generate-pdf', async (req, res) => {
  try {
    const data = req.body;
    
    // Validation des données
    if (!data.client || !data.demande || !data.orderId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Données manquantes (client, demande, orderId requis)' 
      });
    }

    // Créer le document PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      info: {
        Title: `Proposition Siva Créations - ${data.client}`,
        Author: 'Siva Créations',
        Subject: 'Proposition joaillerie personnalisée',
        Keywords: 'joaillerie, bijoux, sur-mesure, luxe'
      }
    });

    // Configuration des headers pour le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="proposition_${data.client.replace(/\s+/g, '_')}_${Date.now()}.pdf"`);

    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // Page 1: Couverture élégante
    addCoverPage(doc, data);
    
    // Page 2: Présentation du projet
    doc.addPage();
    addProjectPage(doc, data);
    
    // Page 3: Image sélectionnée principale
    doc.addPage();
    await addMainImagePage(doc, data);
    
    // Pages alternatives
    if (data.otherImages && data.otherImages.length > 0) {
      const otherImages = data.otherImages.slice(0, 3);
      for (let i = 0; i < otherImages.length; i++) {
        doc.addPage();
        // Ajouter page alternative (à implémenter si nécessaire)
      }
    }
    
    // Page finale: Contact
    doc.addPage();
    addContactPage(doc, data);
    
    // Finaliser le document
    doc.end();

  } catch (error) {
    console.error('Erreur génération PDF:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la génération du PDF' 
    });
  }
});

// Fonction pour ajouter la page contact
function addContactPage(doc, data) {
  let y = 80;

  // Titre avec style
  doc.fillColor(COLORS.primary)
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('PROCHAINES ÉTAPES', 50, y);

  y += 60;

  // Ligne décorative
  doc.moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .strokeColor(COLORS.gold)
     .lineWidth(4)
     .stroke();

  y += 50;

  // Processus avec numérotation stylisée
  const steps = [
    "Validation de votre choix et ajustements éventuels",
    "Sélection des matériaux nobles et finitions",
    "Réalisation par nos maîtres artisans (délai : 3-4 semaines)",
    "Contrôle qualité et finitions d'exception",
    "Livraison dans un écrin de luxe personnalisé"
  ];

  doc.fillColor(COLORS.gold)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('PROCESSUS DE CRÉATION :', 50, y);

  y += 35;

  steps.forEach((step, index) => {
    // Numéro dans un cercle doré
    doc.circle(65, y + 10, 15)
       .fillAndStroke(COLORS.gold, COLORS.darkGold);

    doc.fillColor(COLORS.white)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text((index + 1).toString(), 65, y + 6, { align: 'center' });

    doc.fillColor(COLORS.primary)
       .fontSize(14)
       .font('Helvetica')
       .text(step, 95, y);
    
    y += 30;
  });

  y += 35;

  // Section contact avec style premium
  doc.fillColor(COLORS.gold)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text('NOUS CONTACTER :', 50, y);

  y += 30;

  const contacts = [
    { icon: '📧', text: 'contact@siva-creations.fr' },
    { icon: '📞', text: '+33 1 23 45 67 89' },
    { icon: '🏢', text: '123 Rue de la Paix, 75001 Paris' }
  ];

  contacts.forEach(contact => {
    doc.fillColor(COLORS.primary)
       .fontSize(14)
       .font('Helvetica')
       .text(`${contact.icon}  ${contact.text}`, 65, y);
    y += 25;
  });

  y += 45;

  // Message final avec encadré élégant
  const finalMessage = `Merci de nous avoir fait confiance pour donner vie à votre vision.
Nous avons hâte de créer pour vous cette pièce d'exception unique.`;

  doc.roundedRect(40, y - 15, doc.page.width - 80, 70, 12)
     .fillAndStroke(COLORS.lightGold, COLORS.gold);

  doc.fillColor(COLORS.primary)
     .fontSize(14)
     .font('Helvetica-Oblique')
     .text(finalMessage, 50, y, { 
       width: doc.page.width - 100,
       align: 'center',
       lineGap: 6
     });

  // Footer avec référence
  doc.fillColor(COLORS.gray)
     .fontSize(12)
     .font('Helvetica')
     .text(`Référence commande : ${data.orderId}`, 50, doc.page.height - 80);
}

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Siva PDF Service', version: '1.0.0' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🎨 Service PDF Siva Créations démarré sur le port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
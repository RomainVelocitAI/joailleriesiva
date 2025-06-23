import PDFDocument from 'pdfkit'

type PDFDoc = InstanceType<typeof PDFDocument>

export interface PDFGenerationData {
  client: string
  email: string
  demande: string
  selectedImage: {
    url: string
    index: number
  }
  otherImages: string[]
  orderId: string
}

export class PDFGenerator {
  private static readonly COLORS = {
    primary: '#1a1a1a',
    gold: '#D4AF37',
    lightGold: '#F4E8B8',
    darkGold: '#B8860B',
    white: '#FFFFFF',
    gray: '#666666',
    lightGray: '#F5F5F5',
    black: '#000000'
  }

  static async generateProposal(data: PDFGenerationData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
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
        })

        const buffers: Buffer[] = []
        
        doc.on('data', buffers.push.bind(buffers))
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers)
          resolve(pdfBuffer)
        })

        // Page 1: Couverture élégante
        this.addCoverPage(doc, data)
        
        // Page 2: Présentation du projet
        doc.addPage()
        this.addProjectPage(doc, data)
        
        // Page 3: Image sélectionnée principale
        doc.addPage()
        this.addMainImagePage(doc, data)
        
        // Pages alternatives
        data.otherImages.slice(0, 3).forEach((imageUrl, index) => {
          doc.addPage()
          this.addAlternativeImagePage(doc, imageUrl, index + 1)
        })
        
        // Page finale: Contact et prochaines étapes
        doc.addPage()
        this.addContactPage(doc, data)
        
        doc.end()

      } catch (error) {
        reject(error)
      }
    })
  }

  private static addCoverPage(doc: PDFDoc, data: PDFGenerationData) {
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height
    const centerX = pageWidth / 2

    // Background dégradé doré
    const gradient = doc.linearGradient(0, 0, 0, 200)
    gradient.stop(0, this.COLORS.lightGold)
    gradient.stop(0.5, this.COLORS.gold)
    gradient.stop(1, this.COLORS.darkGold)
    
    doc.rect(0, 0, pageWidth, 200)
       .fill(gradient)

    // Motif décoratif en arrière-plan
    doc.save()
    doc.opacity(0.1)
    for (let i = 0; i < 10; i++) {
      const x = (i * pageWidth) / 10
      doc.moveTo(x, 0)
         .lineTo(x + 100, 200)
         .stroke(this.COLORS.white)
    }
    doc.restore()

    // Logo/Titre principal avec ombre
    doc.save()
    doc.fillColor(this.COLORS.black)
       .fontSize(36)
       .font('Helvetica-Bold')
       .text('SIVA CRÉATIONS', centerX + 2, 92, { align: 'center' })
    
    doc.fillColor(this.COLORS.white)
       .text('SIVA CRÉATIONS', centerX, 90, { align: 'center' })
    doc.restore()

    // Sous-titre avec style délicat
    doc.fillColor(this.COLORS.white)
       .fontSize(16)
       .font('Helvetica')
       .text('J O A I L L E R I E   D \' E X C E P T I O N', centerX, 130, { 
         align: 'center',
         characterSpacing: 2
       })

    // Ligne dorée décorative
    const lineY = 180
    doc.moveTo(centerX - 150, lineY)
       .lineTo(centerX - 50, lineY)
       .moveTo(centerX + 50, lineY)
       .lineTo(centerX + 150, lineY)
       .strokeColor(this.COLORS.white)
       .lineWidth(2)
       .stroke()

    // Diamant central stylisé
    doc.save()
    doc.translate(centerX, lineY)
    doc.moveTo(-15, 0)
       .lineTo(0, -10)
       .lineTo(15, 0)
       .lineTo(0, 10)
       .closePath()
       .fillAndStroke(this.COLORS.white, this.COLORS.darkGold)
    doc.restore()

    // Titre principal de la proposition
    doc.fillColor(this.COLORS.primary)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('PROPOSITION PERSONNALISÉE', 50, 280, { 
         align: 'center',
         width: pageWidth - 100
       })

    // Nom du client avec encadré doré  
    const clientY = 340
    doc.fontSize(22)
    const clientTextWidth = doc.widthOfString(data.client)
    const paddingX = 30
    const paddingY = 15
    
    doc.roundedRect(
      centerX - (clientTextWidth / 2) - paddingX, 
      clientY - paddingY, 
      clientTextWidth + (paddingX * 2), 
      44, 
      8
    )
    .strokeColor(this.COLORS.gold)
    .lineWidth(2)
    .stroke()

    doc.fillColor(this.COLORS.gold)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(data.client, centerX, clientY, { align: 'center' })

    // Citation inspirante avec style italic
    doc.fillColor(this.COLORS.gray)
       .fontSize(14)
       .font('Helvetica-Oblique')
       .text(
         '"Un bijou n\'est pas seulement un accessoire,\nc\'est l\'expression de votre unicité"',
         centerX,
         450,
         { align: 'center' }
       )

    // Date avec style élégant
    const date = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    doc.fillColor(this.COLORS.gray)
       .fontSize(12)
       .font('Helvetica')
       .text(date, centerX, 520, { align: 'center' })

    // Footer avec motif décoratif
    const footerGradient = doc.linearGradient(0, pageHeight - 100, 0, pageHeight)
    footerGradient.stop(0, this.COLORS.lightGold)
    footerGradient.stop(1, this.COLORS.gold)
    
    doc.rect(0, pageHeight - 100, pageWidth, 100)
       .fill(footerGradient)

    // Motifs décoratifs dans le footer
    doc.save()
    doc.opacity(0.3)
    for (let i = 0; i < 6; i++) {
      const x = (i * pageWidth) / 6 + pageWidth / 12
      const y = pageHeight - 50
      doc.circle(x, y, 15)
         .fillAndStroke(this.COLORS.white, this.COLORS.darkGold)
    }
    doc.restore()
  }

  private static addProjectPage(doc: PDFDoc, data: PDFGenerationData) {
    let y = 80

    // En-tête avec ligne décorative
    doc.fillColor(this.COLORS.primary)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('VOTRE VISION, NOTRE SAVOIR-FAIRE', 50, y)

    y += 40

    // Ligne décorative avec dégradé
    const lineGradient = doc.linearGradient(50, y, doc.page.width - 50, y)
    lineGradient.stop(0, this.COLORS.gold)
    lineGradient.stop(0.5, this.COLORS.darkGold)
    lineGradient.stop(1, this.COLORS.gold)
    
    doc.moveTo(50, y)
       .lineTo(doc.page.width - 50, y)
       .strokeColor(lineGradient)
       .lineWidth(3)
       .stroke()

    y += 40

    // Salutation personnalisée
    doc.fillColor(this.COLORS.gold)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(`Cher(e) ${data.client},`, 50, y)

    y += 30

    // Texte d'introduction avec style premium
    const introText = `Nous avons l'honneur de vous présenter une création unique, spécialement conçue selon vos désirs.

Chez Siva Créations, chaque bijou raconte une histoire - la vôtre. Notre équipe d'artisans joailliers a minutieusement étudié votre demande pour concevoir des propositions qui incarnent parfaitement votre vision.

Cette proposition représente l'union parfaite entre tradition joaillière française et innovation contemporaine, pour un résultat à la hauteur de vos attentes les plus exigeantes.`

    doc.fillColor(this.COLORS.primary)
       .fontSize(12)
       .font('Helvetica')
       .text(introText, 50, y, { 
         width: doc.page.width - 100,
         lineGap: 4
       })

    y += 140

    // Section demande avec encadré élégant
    doc.fillColor(this.COLORS.gold)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('VOTRE DEMANDE :', 50, y)

    y += 25

    // Encadré avec ombre pour la demande
    const boxHeight = 80
    
    // Ombre
    doc.save()
    doc.opacity(0.2)
    doc.roundedRect(55, y + 5, doc.page.width - 110, boxHeight, 8)
       .fill(this.COLORS.gray)
    doc.restore()

    // Encadré principal
    doc.roundedRect(50, y, doc.page.width - 100, boxHeight, 8)
       .fillAndStroke(this.COLORS.lightGray, this.COLORS.gold)

    // Texte de la demande
    doc.fillColor(this.COLORS.primary)
       .fontSize(12)
       .font('Helvetica-Oblique')
       .text(`"${data.demande}"`, 60, y + 15, { 
         width: doc.page.width - 120,
         lineGap: 3
       })

    y += boxHeight + 40

    // Engagement qualité avec puces stylisées
    doc.fillColor(this.COLORS.gold)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('NOTRE ENGAGEMENT :', 50, y)

    y += 25

    const engagements = [
      'Matériaux nobles sélectionnés avec soin',
      'Artisanat français d\'excellence',
      'Création unique selon vos spécifications', 
      'Garantie à vie sur nos créations',
      'Service après-vente personnalisé'
    ]

    engagements.forEach(engagement => {
      // Puce dorée stylisée
      doc.circle(60, y + 6, 3)
         .fill(this.COLORS.gold)

      doc.fillColor(this.COLORS.primary)
         .fontSize(12)
         .font('Helvetica')
         .text(engagement, 75, y)
      
      y += 18
    })
  }

  private static addMainImagePage(doc: PDFDoc, data: PDFGenerationData) {
    let y = 80

    // Titre avec effet
    doc.fillColor(this.COLORS.primary)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('VOTRE CRÉATION SÉLECTIONNÉE', 50, y)

    y += 40

    // Ligne décorative
    const centerX = doc.page.width / 2
    doc.moveTo(50, y)
       .lineTo(centerX - 20, y)
       .moveTo(centerX + 20, y) 
       .lineTo(doc.page.width - 50, y)
       .strokeColor(this.COLORS.gold)
       .lineWidth(2)
       .stroke()

    // Diamant central
    doc.save()
    doc.translate(centerX, y)
    doc.moveTo(-10, 0)
       .lineTo(0, -6)
       .lineTo(10, 0)
       .lineTo(0, 6)
       .closePath()
       .fillAndStroke(this.COLORS.gold, this.COLORS.darkGold)
    doc.restore()

    y += 40

    // Cadre décoratif pour l'image
    const imageSize = 200
    const imageX = centerX - imageSize / 2
    
    // Ombre du cadre
    doc.save()
    doc.opacity(0.3)
    doc.roundedRect(imageX + 5, y + 5, imageSize, imageSize, 15)
       .fill(this.COLORS.gray)
    doc.restore()

    // Cadre doré avec dégradé
    const frameGradient = doc.radialGradient(centerX, y + imageSize/2, 0, centerX, y + imageSize/2, imageSize)
    frameGradient.stop(0, this.COLORS.lightGold)
    frameGradient.stop(1, this.COLORS.gold)
    
    doc.roundedRect(imageX - 10, y - 10, imageSize + 20, imageSize + 20, 15)
       .fill(frameGradient)

    // Zone image (placeholder élégant)
    doc.roundedRect(imageX, y, imageSize, imageSize, 10)
       .fillAndStroke(this.COLORS.white, this.COLORS.darkGold)

    // Texte placeholder stylisé
    doc.fillColor(this.COLORS.gray)
       .fontSize(14)
       .font('Helvetica-Oblique')
       .text('Image sélectionnée', centerX, y + imageSize/2 - 10, { align: 'center' })
       .text(`Proposition ${data.selectedImage.index + 1}`, centerX, y + imageSize/2 + 10, { align: 'center' })

    y += imageSize + 50

    // Description émotionnelle avec style premium
    doc.fillColor(this.COLORS.gold)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('UNE CRÉATION QUI VOUS RESSEMBLE', 50, y)

    y += 30

    const description = `Cette création incarne parfaitement l'essence de votre demande. Chaque détail a été pensé pour refléter votre personnalité unique et vos aspirations.

Les lignes élégantes et l'harmonie des proportions créent une pièce d'exception qui saura vous accompagner dans tous vos moments précieux.

Cette réalisation représente l'union parfaite entre tradition joaillière et innovation contemporaine, créant une œuvre d'art portable qui transcende les tendances.`

    doc.fillColor(this.COLORS.primary)
       .fontSize(12)
       .font('Helvetica')
       .text(description, 50, y, { 
         width: doc.page.width - 100,
         lineGap: 4
       })
  }

  private static addAlternativeImagePage(doc: PDFDoc, imageUrl: string, index: number) {
    let y = 80

    // Titre de l'alternative
    doc.fillColor(this.COLORS.primary)
       .fontSize(22)
       .font('Helvetica-Bold')
       .text(`PROPOSITION ALTERNATIVE ${index}`, 50, y)

    y += 40

    // Ligne décorative
    doc.moveTo(50, y)
       .lineTo(doc.page.width - 50, y)
       .strokeColor(this.COLORS.gold)
       .lineWidth(2)
       .stroke()

    y += 40

    // Image alternative avec cadre
    const imageSize = 150
    const centerX = doc.page.width / 2
    const imageX = centerX - imageSize / 2
    
    doc.roundedRect(imageX - 5, y - 5, imageSize + 10, imageSize + 10, 10)
       .fillAndStroke(this.COLORS.lightGold, this.COLORS.gold)

    doc.roundedRect(imageX, y, imageSize, imageSize, 8)
       .fillAndStroke(this.COLORS.white, this.COLORS.darkGold)

    doc.fillColor(this.COLORS.gray)
       .fontSize(12)
       .font('Helvetica-Oblique')
       .text(`Alternative ${index}`, centerX, y + imageSize/2, { align: 'center' })

    y += imageSize + 40

    // Description de l'alternative
    const altTexts = [
      "Une interprétation audacieuse de votre vision, mêlant modernité et raffinement pour une approche contemporaine de l'élégance classique.",
      "Cette variation explore une esthétique plus traditionnelle, privilégiant la pureté des lignes et l'intemporalité du design joaillier français.",
      "Une proposition originale qui revisite les codes traditionnels avec une touche d'innovation créative et un esprit résolument moderne."
    ]

    doc.fillColor(this.COLORS.primary)
       .fontSize(12)
       .font('Helvetica')
       .text(altTexts[index - 1] || altTexts[0], 50, y, { 
         width: doc.page.width - 100,
         lineGap: 4
       })
  }

  private static addContactPage(doc: PDFDoc, data: PDFGenerationData) {
    let y = 80

    // Titre avec style
    doc.fillColor(this.COLORS.primary)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('PROCHAINES ÉTAPES', 50, y)

    y += 50

    // Ligne décorative
    doc.moveTo(50, y)
       .lineTo(doc.page.width - 50, y)
       .strokeColor(this.COLORS.gold)
       .lineWidth(3)
       .stroke()

    y += 40

    // Processus avec numérotation stylisée
    const steps = [
      "Validation de votre choix et ajustements éventuels",
      "Sélection des matériaux nobles et finitions",
      "Réalisation par nos maîtres artisans (délai : 3-4 semaines)",
      "Contrôle qualité et finitions d'exception",
      "Livraison dans un écrin de luxe personnalisé"
    ]

    doc.fillColor(this.COLORS.gold)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('PROCESSUS DE CRÉATION :', 50, y)

    y += 30

    steps.forEach((step, index) => {
      // Numéro dans un cercle doré
      doc.circle(60, y + 8, 12)
         .fillAndStroke(this.COLORS.gold, this.COLORS.darkGold)

      doc.fillColor(this.COLORS.white)
         .fontSize(10)
         .font('Helvetica-Bold')
         .text((index + 1).toString(), 60, y + 4, { align: 'center' })

      doc.fillColor(this.COLORS.primary)
         .fontSize(12)
         .font('Helvetica')
         .text(step, 85, y)
      
      y += 25
    })

    y += 30

    // Section contact avec style premium
    doc.fillColor(this.COLORS.gold)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('NOUS CONTACTER :', 50, y)

    y += 25

    const contacts = [
      { icon: '📧', text: 'contact@siva-creations.fr' },
      { icon: '📞', text: '+33 1 23 45 67 89' },
      { icon: '🏢', text: '123 Rue de la Paix, 75001 Paris' }
    ]

    contacts.forEach(contact => {
      doc.fillColor(this.COLORS.primary)
         .fontSize(12)
         .font('Helvetica')
         .text(`${contact.icon}  ${contact.text}`, 60, y)
      y += 20
    })

    y += 40

    // Message final avec encadré élégant
    const finalMessage = `Merci de nous avoir fait confiance pour donner vie à votre vision.
Nous avons hâte de créer pour vous cette pièce d'exception unique.`

    doc.roundedRect(40, y - 10, doc.page.width - 80, 60, 8)
       .fillAndStroke(this.COLORS.lightGold, this.COLORS.gold)

    doc.fillColor(this.COLORS.primary)
       .fontSize(12)
       .font('Helvetica-Oblique')
       .text(finalMessage, 50, y, { 
         width: doc.page.width - 100,
         align: 'center',
         lineGap: 4
       })

    // Footer avec référence
    doc.fillColor(this.COLORS.gray)
       .fontSize(10)
       .font('Helvetica')
       .text(`Référence commande : ${data.orderId}`, 50, doc.page.height - 70)
  }
}
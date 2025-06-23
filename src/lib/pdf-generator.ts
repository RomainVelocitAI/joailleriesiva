import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  private static readonly PAGE_WIDTH = 210 // A4 width in mm
  private static readonly PAGE_HEIGHT = 297 // A4 height in mm
  private static readonly MARGIN = 20

  private static readonly COLORS = {
    primary: '#1a1a1a',
    gold: '#D4AF37',
    lightGold: '#F4E8B8',
    gray: '#666666',
    lightGray: '#F5F5F5'
  }

  private static readonly FONTS = {
    title: 24,
    subtitle: 18,
    body: 12,
    small: 10
  }

  static async generateProposal(data: PDFGenerationData): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // Page 1: Couverture
    this.addCoverPage(pdf, data)
    
    // Page 2: Présentation du projet
    pdf.addPage()
    this.addProjectPage(pdf, data)
    
    // Page 3: Image sélectionnée principale
    pdf.addPage()
    await this.addMainImagePage(pdf, data)
    
    // Pages 4-6: Autres propositions (maximum 3)
    const otherImages = data.otherImages.slice(0, 3)
    for (let i = 0; i < otherImages.length; i++) {
      pdf.addPage()
      await this.addAlternativeImagePage(pdf, otherImages[i], i + 1)
    }
    
    // Page finale: Contact et prochaines étapes
    pdf.addPage()
    this.addContactPage(pdf, data)
    
    return pdf.output('blob')
  }

  private static addCoverPage(pdf: jsPDF, data: PDFGenerationData) {
    const centerX = this.PAGE_WIDTH / 2
    
    // Background décoratif
    pdf.setFillColor(this.COLORS.lightGold)
    pdf.rect(0, 0, this.PAGE_WIDTH, 80, 'F')
    
    // Logo/Titre principal
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.title + 8)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('SIVA CRÉATIONS', centerX, 40, { align: 'center' })
    
    // Sous-titre
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('Joaillerie d\'Exception', centerX, 55, { align: 'center' })
    
    // Titre principal centré
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.title)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('PROPOSITION PERSONNALISÉE', centerX, 120, { align: 'center' })
    
    // Nom du client
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text(`Pour ${data.client}`, centerX, 140, { align: 'center' })
    
    // Citation inspirante
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(this.FONTS.body + 2)
    pdf.setTextColor(this.COLORS.gray)
    const quote = '"Un bijou n\'est pas seulement un accessoire,\nc\'est l\'expression de votre unicité"'
    pdf.text(quote, centerX, 180, { align: 'center' })
    
    // Ligne décorative
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(0.5)
    pdf.line(centerX - 30, 200, centerX + 30, 200)
    
    // Date
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.small)
    pdf.setTextColor(this.COLORS.gray)
    const date = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    pdf.text(date, centerX, 220, { align: 'center' })
    
    // Footer décoratif
    pdf.setFillColor(this.COLORS.lightGold)
    pdf.rect(0, this.PAGE_HEIGHT - 30, this.PAGE_WIDTH, 30, 'F')
  }

  private static addProjectPage(pdf: jsPDF, data: PDFGenerationData) {
    let yPos = 30
    
    // Titre de la page
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.title)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('VOTRE VISION, NOTRE SAVOIR-FAIRE', this.MARGIN, yPos)
    
    yPos += 20
    
    // Ligne décorative
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(1)
    pdf.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos)
    
    yPos += 25
    
    // Section client
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('Cher(e) ' + data.client + ',', this.MARGIN, yPos)
    
    yPos += 20
    
    // Texte d'introduction
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    
    const introText = `Nous avons l'honneur de vous présenter une création unique, spécialement conçue selon vos désirs. 

Chez Siva Créations, chaque bijou raconte une histoire - la vôtre. Notre équipe d'artisans joailliers a minutieusement étudié votre demande pour concevoir des propositions qui incarnent parfaitement votre vision.`
    
    const lines = pdf.splitTextToSize(introText, this.PAGE_WIDTH - 2 * this.MARGIN)
    pdf.text(lines, this.MARGIN, yPos)
    yPos += lines.length * 6 + 15
    
    // Section demande
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('VOTRE DEMANDE :', this.MARGIN, yPos)
    
    yPos += 15
    
    // Encadré pour la demande
    pdf.setFillColor(this.COLORS.lightGray)
    const demandeHeight = 40
    pdf.rect(this.MARGIN, yPos - 5, this.PAGE_WIDTH - 2 * this.MARGIN, demandeHeight, 'F')
    
    // Bordure dorée
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(0.5)
    pdf.rect(this.MARGIN, yPos - 5, this.PAGE_WIDTH - 2 * this.MARGIN, demandeHeight)
    
    // Texte de la demande
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    const demandeLines = pdf.splitTextToSize(`"${data.demande}"`, this.PAGE_WIDTH - 2 * this.MARGIN - 10)
    pdf.text(demandeLines, this.MARGIN + 5, yPos + 5)
    
    yPos += demandeHeight + 25
    
    // Promesse de qualité
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.body + 1)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('NOTRE ENGAGEMENT :', this.MARGIN, yPos)
    
    yPos += 15
    
    const engagementText = `• Matériaux nobles sélectionnés avec soin
• Artisanat français d'excellence 
• Création unique selon vos spécifications
• Garantie à vie sur nos créations
• Service après-vente personnalisé`
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    const engagementLines = engagementText.split('\n')
    engagementLines.forEach(line => {
      pdf.text(line, this.MARGIN + 5, yPos)
      yPos += 8
    })
  }

  private static async addMainImagePage(pdf: jsPDF, data: PDFGenerationData) {
    let yPos = 30
    
    // Titre
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.title)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('VOTRE CRÉATION SÉLECTIONNÉE', this.MARGIN, yPos)
    
    yPos += 15
    
    // Ligne décorative
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(1)
    pdf.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos)
    
    yPos += 20
    
    // Image principale (simulée avec un rectangle pour l'instant)
    const imageWidth = 120
    const imageHeight = 120
    const imageX = (this.PAGE_WIDTH - imageWidth) / 2
    
    // Cadre décoratif pour l'image
    pdf.setFillColor(this.COLORS.lightGold)
    pdf.rect(imageX - 5, yPos - 5, imageWidth + 10, imageHeight + 10, 'F')
    
    // Placeholder pour l'image (sera remplacé par l'image réelle)
    pdf.setFillColor(255, 255, 255)
    pdf.rect(imageX, yPos, imageWidth, imageHeight, 'F')
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(2)
    pdf.rect(imageX, yPos, imageWidth, imageHeight)
    
    // Texte temporaire au centre de l'image
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.small)
    pdf.setTextColor(this.COLORS.gray)
    pdf.text('Image sélectionnée', imageX + imageWidth/2, yPos + imageHeight/2, { align: 'center' })
    
    yPos += imageHeight + 25
    
    // Description émotionnelle
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('UNE CRÉATION QUI VOUS RESSEMBLE', this.MARGIN, yPos)
    
    yPos += 15
    
    const descriptionText = `Cette création incarne parfaitement l'essence de votre demande. Chaque détail a été pensé pour refléter votre personnalité unique et vos aspirations.

Les lignes élégantes et l'harmonie des proportions créent une pièce d'exception qui saura vous accompagner dans tous vos moments précieux.

Cette réalisation représente l'union parfaite entre tradition joaillière et innovation contemporaine, pour un résultat à la hauteur de vos attentes les plus exigeantes.`
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    const descLines = pdf.splitTextToSize(descriptionText, this.PAGE_WIDTH - 2 * this.MARGIN)
    pdf.text(descLines, this.MARGIN, yPos)
  }

  private static async addAlternativeImagePage(pdf: jsPDF, imageUrl: string, index: number) {
    let yPos = 30
    
    // Titre
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.title)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text(`PROPOSITION ALTERNATIVE ${index}`, this.MARGIN, yPos)
    
    yPos += 15
    
    // Ligne décorative
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(1)
    pdf.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos)
    
    yPos += 20
    
    // Image alternative (placeholder)
    const imageWidth = 100
    const imageHeight = 100
    const imageX = (this.PAGE_WIDTH - imageWidth) / 2
    
    pdf.setFillColor(this.COLORS.lightGray)
    pdf.rect(imageX, yPos, imageWidth, imageHeight, 'F')
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(1)
    pdf.rect(imageX, yPos, imageWidth, imageHeight)
    
    yPos += imageHeight + 20
    
    // Description de l'alternative
    const altTexts = [
      "Une interprétation audacieuse de votre vision, mêlant modernité et raffinement pour une approche contemporaine de l'élégance.",
      "Cette variation explore une esthétique plus classique, privilégiant la pureté des lignes et l'intemporalité du design.",
      "Une proposition originale qui revisite les codes traditionnels avec une touche d'innovation et de créativité."
    ]
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    const altLines = pdf.splitTextToSize(altTexts[index - 1] || altTexts[0], this.PAGE_WIDTH - 2 * this.MARGIN)
    pdf.text(altLines, this.MARGIN, yPos)
  }

  private static addContactPage(pdf: jsPDF, data: PDFGenerationData) {
    let yPos = 30
    
    // Titre
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.title)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('PROCHAINES ÉTAPES', this.MARGIN, yPos)
    
    yPos += 20
    
    // Ligne décorative
    pdf.setDrawColor(this.COLORS.gold)
    pdf.setLineWidth(1)
    pdf.line(this.MARGIN, yPos, this.PAGE_WIDTH - this.MARGIN, yPos)
    
    yPos += 25
    
    // Processus
    const steps = [
      "1. Validation de votre choix et ajustements éventuels",
      "2. Sélection des matériaux et finitions",
      "3. Réalisation par nos maîtres artisans (délai : 3-4 semaines)",
      "4. Contrôle qualité et finitions",
      "5. Livraison dans un écrin d'exception"
    ]
    
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('PROCESSUS DE CRÉATION :', this.MARGIN, yPos)
    
    yPos += 15
    
    steps.forEach(step => {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(this.FONTS.body)
      pdf.setTextColor(this.COLORS.primary)
      pdf.text(step, this.MARGIN + 5, yPos)
      yPos += 10
    })
    
    yPos += 20
    
    // Contact
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(this.FONTS.subtitle)
    pdf.setTextColor(this.COLORS.gold)
    pdf.text('NOUS CONTACTER :', this.MARGIN, yPos)
    
    yPos += 15
    
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.body)
    pdf.setTextColor(this.COLORS.primary)
    pdf.text('📧 Email : contact@siva-creations.fr', this.MARGIN + 5, yPos)
    yPos += 10
    pdf.text('📞 Téléphone : +33 1 23 45 67 89', this.MARGIN + 5, yPos)
    yPos += 10
    pdf.text('🏢 Atelier : 123 Rue de la Paix, 75001 Paris', this.MARGIN + 5, yPos)
    
    yPos += 30
    
    // Message final
    pdf.setFont('helvetica', 'italic')
    pdf.setFontSize(this.FONTS.body + 1)
    pdf.setTextColor(this.COLORS.gold)
    const finalMessage = `Merci de nous avoir fait confiance pour donner vie à votre vision.
Nous avons hâte de créer pour vous cette pièce d'exception.`
    
    const finalLines = pdf.splitTextToSize(finalMessage, this.PAGE_WIDTH - 2 * this.MARGIN)
    pdf.text(finalLines, this.MARGIN, yPos)
    
    // Footer avec ID de commande
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(this.FONTS.small)
    pdf.setTextColor(this.COLORS.gray)
    pdf.text(`Référence commande : ${data.orderId}`, this.MARGIN, this.PAGE_HEIGHT - 15)
  }
}
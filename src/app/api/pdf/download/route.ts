import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { PDFGenerator } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, selectedImageIndex } = body
    
    if (!orderId || typeof selectedImageIndex !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Récupérer la commande
    const order = await AirtableService.getOrder(orderId)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const imageFields = [`Image 1`, `Image 2`, `Image 3`, `Image 4`] as const
    const selectedImageField = imageFields[selectedImageIndex]
    const selectedImageUrl = order.fields[selectedImageField]?.[0]?.url

    if (!selectedImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Selected image not found' },
        { status: 404 }
      )
    }

    // Récupérer toutes les images pour les alternatives
    const allImages = [
      order.fields['Image 1']?.[0]?.url,
      order.fields['Image 2']?.[0]?.url,
      order.fields['Image 3']?.[0]?.url,
      order.fields['Image 4']?.[0]?.url,
    ].filter(Boolean) as string[]

    // Filtrer pour obtenir les autres images (non sélectionnées)
    const otherImages = allImages.filter((_, index) => index !== selectedImageIndex)

    // Préparer les données pour la génération PDF
    const pdfData = {
      client: order.fields.Client,
      email: order.fields.Email || '',
      demande: order.fields.Demande,
      selectedImage: {
        url: selectedImageUrl,
        index: selectedImageIndex
      },
      otherImages,
      orderId
    }

    // Générer le PDF
    const pdfBlob = await PDFGenerator.generateProposal(pdfData)
    const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())
    
    // Créer un nom de fichier
    const filename = `proposition_${order.fields.Client.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    
    // Retourner le PDF en tant que réponse téléchargeable
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error downloading PDF:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { WebhookService } from '@/lib/webhooks'

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

    await AirtableService.updateOrder(orderId, {
      'Selected Image': selectedImageIndex + 1
    })

    const webhookPayload = {
      orderId,
      selectedImageIndex,
      clientData: {
        name: order.fields.Client,
        email: order.fields.email || '',
        phone: order.fields.phone,
        boutique: order.fields['Nom boutique']
      }
    }

    const webhookResult = await WebhookService.generatePDF(webhookPayload)

    if (!webhookResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate PDF' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'PDF generation request sent successfully'
    })

  } catch (error) {
    console.error('Error generating PDF:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
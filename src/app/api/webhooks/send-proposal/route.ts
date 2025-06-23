import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { WebhookService } from '@/lib/webhooks'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { orderId, recipientEmail } = body
    
    if (!orderId || !recipientEmail) {
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

    const pdfUrl = order.fields.PDF?.[0]?.url

    if (!pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'PDF not found for this order' },
        { status: 404 }
      )
    }

    const webhookPayload = {
      orderId,
      recipientEmail,
      clientName: order.fields.Client,
      pdfUrl
    }

    const webhookResult = await WebhookService.sendProposal(webhookPayload)

    if (!webhookResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send proposal' },
        { status: 500 }
      )
    }

    await AirtableService.updateOrder(orderId, {
      Status: 'sent'
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Proposal sent successfully'
    })

  } catch (error) {
    console.error('Error sending proposal:', error)
    
    return NextResponse.json(
      { success: false, error: 'Failed to send proposal' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { WebhookService } from '@/lib/webhooks'
import { orderFormSchema } from '@/lib/validations'
import mockData from '@/mocks/data.json'

// Mode développement avec mock data
const isDevelopment = process.env.NODE_ENV === 'development'
const useMockMode = isDevelopment && (!process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_MOCK_MODE === 'true')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const validatedData = orderFormSchema.parse(body)
    
    const demande = `Type: ${validatedData.jewelryType}
Style: ${validatedData.styleDescription}
Matériaux: ${validatedData.materials}
${validatedData.otherNotes ? `Notes: ${validatedData.otherNotes}` : ''}`

    const orderData = {
      client: `${validatedData.firstName} ${validatedData.lastName}`,
      email: validatedData.email,
      demande
    }

    if (useMockMode) {
      // Mode mock - simulation de création d'ordre
      console.log('🔧 Mode développement - Simulation de création d\'ordre:', orderData)
      
      const mockOrderId = `mock_${Date.now()}`
      
      return NextResponse.json({ 
        success: true, 
        orderId: mockOrderId,
        webhookTriggered: true,
        mockMode: true
      })
    }

    // Mode production - vraie intégration Airtable
    const order = await AirtableService.createOrder(orderData)

    const webhookPayload = {
      orderId: order.id,
      client: orderData.client,
      email: orderData.email,
      demande: orderData.demande,
      inspirationImages: body.inspirationImageUrls || []
    }

    // Tentative webhook avec fallback
    let webhookResult: { success: boolean; error?: string } = { success: false, error: 'No webhook configured' }
    try {
      webhookResult = await WebhookService.generateImages(webhookPayload)
    } catch (webhookError) {
      console.warn('Webhook failed, continuing without:', webhookError)
      webhookResult = { success: false, error: 'Webhook connection failed' }
    }

    if (!webhookResult.success) {
      console.log('Webhook failed, but continuing (no Status field to update)')
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      webhookTriggered: webhookResult.success
    })

  } catch (error) {
    console.error('Error creating order:', error)
    
    // En développement, retourner des détails d'erreur plus précis
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'Failed to create order'
    
    return NextResponse.json(
      { success: false, error: errorMessage, details: isDevelopment ? String(error) : undefined },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('id')

    if (useMockMode) {
      // Mode mock - utilisation des données fictives
      console.log('🔧 Mode développement - Retour des données mock')
      
      if (orderId) {
        const order = mockData.orders.find(o => o.id === orderId)
        if (!order) {
          return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
        }
        return NextResponse.json({ success: true, order, mockMode: true })
      } else {
        return NextResponse.json({ success: true, orders: mockData.orders, mockMode: true })
      }
    }

    // Mode production - vraie intégration Airtable
    if (orderId) {
      const order = await AirtableService.getOrder(orderId)
      return NextResponse.json({ success: true, order })
    } else {
      const orders = await AirtableService.getOrders()
      return NextResponse.json({ success: true, orders })
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'Failed to fetch orders'
    
    return NextResponse.json(
      { success: false, error: errorMessage, details: isDevelopment ? String(error) : undefined },
      { status: 500 }
    )
  }
}
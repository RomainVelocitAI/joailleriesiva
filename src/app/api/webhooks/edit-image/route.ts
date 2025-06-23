import { NextRequest, NextResponse } from 'next/server'
import { AirtableService } from '@/lib/airtable'
import { WebhookService } from '@/lib/webhooks'
import { editImageSchema } from '@/lib/validations'

const isDevelopment = process.env.NODE_ENV === 'development'
const useMockMode = isDevelopment && (!process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_MOCK_MODE === 'true')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { orderId, imageIndex, instruction } = body
    
    if (!orderId || typeof imageIndex !== 'number' || !instruction) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validatedInstruction = editImageSchema.parse({ instruction })

    if (useMockMode) {
      // Mode mock - simulation d'édition d'image
      console.log('🔧 Mode développement - Simulation d\'édition d\'image:', {
        orderId,
        imageIndex,
        instruction: validatedInstruction.instruction
      })
      
      return NextResponse.json({ 
        success: true, 
        message: 'Image edit request sent successfully (mock mode)',
        mockMode: true
      })
    }

    // Mode production
    const order = await AirtableService.getOrder(orderId)
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const imageFields = [`Image 1`, `Image 2`, `Image 3`, `Image 4`] as const
    const currentImageField = imageFields[imageIndex]
    const currentImageUrl = order.fields[currentImageField]?.[0]?.url

    if (!currentImageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      )
    }

    const webhookPayload = {
      orderId,
      imageIndex,
      editInstruction: validatedInstruction.instruction,
      currentImageUrl
    }

    const webhookResult = await WebhookService.editImage(webhookPayload)

    if (!webhookResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to edit image' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Image edit request sent successfully'
    })

  } catch (error) {
    console.error('Error editing image:', error)
    
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'Failed to edit image'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
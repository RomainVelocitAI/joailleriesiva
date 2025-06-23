interface WebhookResponse {
  success: boolean
  data?: unknown
  error?: string
}

export interface ImageGenerationPayload {
  orderId: string
  client: string
  email: string
  demande: string
  inspirationImages?: string[]
}

export interface ImageEditPayload {
  orderId: string
  imageIndex: number
  editInstruction: string
  currentImageUrl: string
}

export interface PDFGenerationPayload {
  orderId: string
  selectedImageIndex: number
  clientData: {
    name: string
    email: string
  }
}

export interface SendProposalPayload {
  orderId: string
  recipientEmail: string
  clientName: string
  pdfUrl: string
}

export class WebhookService {
  private static async callWebhook(url: string, payload: unknown): Promise<WebhookResponse> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error('Webhook error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async generateImages(payload: ImageGenerationPayload): Promise<WebhookResponse> {
    const webhookUrl = process.env.WEBHOOK_IMAGE_GENERATION
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not configured' }
    }

    return this.callWebhook(webhookUrl, payload)
  }

  static async editImage(payload: ImageEditPayload): Promise<WebhookResponse> {
    const webhookUrl = process.env.WEBHOOK_IMAGE_EDIT
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not configured' }
    }

    return this.callWebhook(webhookUrl, payload)
  }

  static async generatePDF(payload: PDFGenerationPayload): Promise<WebhookResponse> {
    const webhookUrl = process.env.WEBHOOK_PDF_GENERATION
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not configured' }
    }

    return this.callWebhook(webhookUrl, payload)
  }

  static async sendProposal(payload: SendProposalPayload): Promise<WebhookResponse> {
    const webhookUrl = process.env.WEBHOOK_SEND_PROPOSAL
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not configured' }
    }

    return this.callWebhook(webhookUrl, payload)
  }
}

export default WebhookService
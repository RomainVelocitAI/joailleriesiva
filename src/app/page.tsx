"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { History, Sparkles, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { PremiumForm } from "@/components/forms/premium-form"
import { ImageGrid } from "@/components/cards/card-select"
import { EditModal } from "@/components/modals/edit-modal"
import { useToast } from "@/components/ui/toast"
import { type OrderFormData } from "@/lib/validations"

interface AppState {
  currentStep: "form" | "images" | "pdf_ready"
  orderId?: string
  images: (string | null)[]
  selectedImageIndex: number | null
  isLoading: boolean
}

export default function Home() {
  const { addToast } = useToast()
  const [state, setState] = useState<AppState>({
    currentStep: "form",
    images: [],
    selectedImageIndex: null,
    isLoading: false
  })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProductionReady = process.env.AIRTABLE_API_KEY && process.env.WEBHOOK_IMAGE_GENERATION
  
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    imageIndex: number
    currentImage: string
  }>({
    isOpen: false,
    imageIndex: 0,
    currentImage: ""
  })

  // Fonction pour récupérer les images mises à jour depuis Airtable
  const pollForImages = async () => {
    if (!state.orderId || state.currentStep !== "images") return

    try {
      const response = await fetch(`/api/orders/${state.orderId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.order) {
          const newImages = [
            data.order.fields['Image 1']?.[0]?.url || null,
            data.order.fields['Image 2']?.[0]?.url || null,
            data.order.fields['Image 3']?.[0]?.url || null,
            data.order.fields['Image 4']?.[0]?.url || null,
          ]
          
          // Mettre à jour seulement si les images ont changé
          setState(prev => {
            const hasChanged = newImages.some((img, index) => img !== prev.images[index])
            if (hasChanged) {
              // Vérifier si toutes les images sont maintenant disponibles
              const allImagesLoaded = newImages.every(img => img !== null)
              if (allImagesLoaded && newImages.some(img => img !== null)) {
                addToast({
                  type: "success",
                  title: "Propositions prêtes !",
                  description: "Vos 4 créations personnalisées sont disponibles"
                })
              }
              return { ...prev, images: newImages }
            }
            return prev
          })
        }
      }
    } catch (error) {
      console.error('Error polling for images:', error)
    }
  }

  // Démarrer le polling quand on passe à l'étape images
  useEffect(() => {
    if (state.currentStep === "images" && state.orderId) {
      // Démarrer le polling toutes les 3 secondes
      pollingRef.current = setInterval(pollForImages, 3000)
      
      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
      }
    }
  }, [state.currentStep, state.orderId])

  // Nettoyer le polling quand le composant se démonte
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  const handleFormSubmit = async (data: OrderFormData & { inspirationImages?: File[] }) => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        const result = await response.json()
        setState(prev => ({
          ...prev,
          orderId: result.orderId,
          currentStep: "images",
          isLoading: false
        }))
        
        const toastMessage = result.mockMode 
          ? "Mode développement - Simulation de création"
          : "Vos propositions sont en cours de génération..."
        
        addToast({
          type: "success",
          title: "Commande créée !",
          description: toastMessage
        })

        // Initialiser les slots d'images vides
        setState(prev => ({
          ...prev,
          images: [null, null, null, null]
        }))

        // En mode mock, simuler la génération d'images après un délai
        if (result.mockMode) {
          const imageUrls = [
            "https://picsum.photos/400/400?random=1",
            "https://picsum.photos/400/400?random=2", 
            "https://picsum.photos/400/400?random=3",
            "https://picsum.photos/400/400?random=4"
          ]

          imageUrls.forEach((url, index) => {
            setTimeout(() => {
              setState(prev => ({
                ...prev,
                images: prev.images.map((img, i) => i === index ? url : img)
              }))
              
              if (index === imageUrls.length - 1) {
                addToast({
                  type: "success",
                  title: "Propositions prêtes !",
                  description: "Images de démonstration générées"
                })
              }
            }, 1000 + (index * 1500)) // 1s, 2.5s, 4s, 5.5s
          })
        }
        // En mode production, les images seront mises à jour par les webhooks n8n
        
      } else {
        throw new Error('Erreur lors de la création')
      }
    } catch {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de créer votre commande"
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const handleImageSelect = (index: number) => {
    setState(prev => ({ ...prev, selectedImageIndex: index }))
  }

  const handleImageEdit = (index: number) => {
    const image = state.images[index]
    if (!image) return
    
    setEditModal({
      isOpen: true,
      imageIndex: index,
      currentImage: image
    })
  }

  const handleEditSubmit = async (instruction: string, imageIndex: number) => {
    if (!state.orderId) return

    try {
      const response = await fetch('/api/webhooks/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: state.orderId,
          imageIndex,
          instruction
        })
      })

      if (response.ok) {
        addToast({
          type: "success",
          title: "Modification en cours",
          description: "Votre image est en cours de personnalisation..."
        })

        // Simulation du remplacement d'image
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            images: prev.images.map((img, i) => 
              i === imageIndex ? `https://picsum.photos/400/400?random=${Date.now()}` : img
            )
          }))
          
          addToast({
            type: "success",
            title: "Image mise à jour !",
            description: "Votre proposition a été personnalisée"
          })
        }, 2000)
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de modifier l'image"
      })
    }
  }

  const handleGeneratePDF = async () => {
    if (!state.orderId || state.selectedImageIndex === null) return

    setState(prev => ({ ...prev, isLoading: true }))
    
    try {
      const response = await fetch('/api/webhooks/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: state.orderId,
          selectedImageIndex: state.selectedImageIndex
        })
      })

      if (response.ok) {
        addToast({
          type: "success",
          title: "PDF en cours de génération",
          description: "Votre proposition sera bientôt prête"
        })

        // Déclencher le téléchargement automatique du PDF
        setTimeout(async () => {
          try {
            const downloadResponse = await fetch('/api/pdf/download', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: state.orderId,
                selectedImageIndex: state.selectedImageIndex
              })
            })

            if (downloadResponse.ok) {
              const blob = await downloadResponse.blob()
              const url = window.URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.style.display = 'none'
              a.href = url
              a.download = `proposition_${Date.now()}.pdf`
              document.body.appendChild(a)
              a.click()
              window.URL.revokeObjectURL(url)
              document.body.removeChild(a)
            }
          } catch (error) {
            console.error('Error downloading PDF:', error)
          }

          setState(prev => ({ 
            ...prev, 
            currentStep: "pdf_ready",
            isLoading: false 
          }))
          
          addToast({
            type: "success",
            title: "Proposition finalisée !",
            description: "Votre PDF a été téléchargé automatiquement"
          })
        }, 2000)
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de générer le PDF"
      })
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Development Banner */}
      {isDevelopment && !isProductionReady && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2">
          <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span>Mode développement - Données de démonstration</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">Siva Créations</h1>
            </div>
            
            <Link href="/historique">
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                Historique
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {state.currentStep === "form" && (
          <PremiumForm 
            onSubmit={handleFormSubmit}
            isLoading={state.isLoading}
          />
        )}

        {state.currentStep === "images" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <ImageGrid
              images={state.images}
              selectedIndex={state.selectedImageIndex}
              onSelect={handleImageSelect}
              onEdit={handleImageEdit}
              isLoading={state.isLoading}
            />

            {state.selectedImageIndex !== null && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <Button
                  onClick={handleGeneratePDF}
                  disabled={state.isLoading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {state.isLoading ? (
                    "Génération en cours..."
                  ) : (
                    <>
                      Générer la proposition PDF
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {state.currentStep === "pdf_ready" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-green-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Proposition finalisée !</h2>
              <p className="text-muted-foreground">
                Votre création personnalisée est prête. Vous pouvez la consulter dans votre historique.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/historique">
                <Button size="lg">
                  Voir l'historique
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setState({
                  currentStep: "form",
                  images: [],
                  selectedImageIndex: null,
                  isLoading: false
                })}
              >
                Nouvelle création
              </Button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        currentImage={editModal.currentImage}
        imageIndex={editModal.imageIndex}
        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
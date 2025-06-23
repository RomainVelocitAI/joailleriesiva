"use client"

import { useState } from "react"
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
  images: string[]
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

        // Simulation des images générées (toujours en mode démo)
        setTimeout(() => {
          setState(prev => ({
            ...prev,
            images: [
              "https://picsum.photos/400/400?random=1",
              "https://picsum.photos/400/400?random=2", 
              "https://picsum.photos/400/400?random=3",
              "https://picsum.photos/400/400?random=4"
            ]
          }))
          
          addToast({
            type: "success",
            title: "Propositions prêtes !",
            description: result.mockMode 
              ? "Images de démonstration générées"
              : "Vos 4 créations personnalisées sont disponibles"
          })
        }, 3000)
        
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
    setEditModal({
      isOpen: true,
      imageIndex: index,
      currentImage: state.images[index]
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
              i === imageIndex ? `/api/placeholder/400/${400 + Math.random() * 100}` : img
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

        setTimeout(() => {
          setState(prev => ({ 
            ...prev, 
            currentStep: "pdf_ready",
            isLoading: false 
          }))
          
          addToast({
            type: "success",
            title: "Proposition finalisée !",
            description: "Votre PDF est disponible dans l'historique"
          })
        }, 3000)
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
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Edit3, Check, FileText, ArrowRight } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EditModal } from "@/components/modals/edit-modal"
import { useToast } from "@/components/ui/toast"
import { OrderRecord } from "@/lib/airtable"
import { cn } from "@/lib/utils"

interface ViewOrderModalProps {
  isOpen: boolean
  order: OrderRecord | null
  onClose: () => void
}

export function ViewOrderModal({ isOpen, order, onClose }: ViewOrderModalProps) {
  const { addToast } = useToast()
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    imageIndex: number
    currentImage: string
  }>({
    isOpen: false,
    imageIndex: 0,
    currentImage: ""
  })

  if (!order) return null

  const images = [
    order.fields['Image 1']?.[0]?.url,
    order.fields['Image 2']?.[0]?.url,
    order.fields['Image 3']?.[0]?.url,
    order.fields['Image 4']?.[0]?.url,
  ]

  const handleImageEdit = (index: number) => {
    const image = images[index]
    if (!image) return
    
    setEditModal({
      isOpen: true,
      imageIndex: index,
      currentImage: image
    })
  }

  const handleEditSubmit = async (instruction: string, imageIndex: number) => {
    try {
      const response = await fetch('/api/webhooks/edit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
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
        
        // Refresh the order data after edit
        setTimeout(() => {
          window.location.reload()
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
    if (selectedImageIndex === null) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/webhooks/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          selectedImageIndex
        })
      })

      if (response.ok) {
        addToast({
          type: "success",
          title: "PDF en cours de génération",
          description: "Votre nouvelle proposition sera bientôt prête"
        })
        
        setTimeout(() => {
          setIsLoading(false)
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Erreur",
        description: "Impossible de générer le PDF"
      })
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Commande de {order.fields.Client}</span>
          </DialogTitle>
          <DialogDescription>
            {order.fields.Email && (
              <span className="text-sm text-muted-foreground">
                {order.fields.Email}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Demande */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Demande</h3>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="whitespace-pre-wrap">{order.fields.Demande}</p>
            </div>
          </div>

          {/* Images générées */}
          {images.some(img => img) && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Propositions générées ({images.filter(Boolean).length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((imageUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div 
                      className={cn(
                        "aspect-square rounded-lg border-2 overflow-hidden bg-muted/50 cursor-pointer transition-all duration-200",
                        selectedImageIndex === index 
                          ? "border-primary shadow-lg shadow-primary/25 ring-1 ring-primary/50" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => imageUrl && setSelectedImageIndex(index)}
                    >
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Proposition ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-sm">Aucune image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Selection Indicator */}
                    {selectedImageIndex === index && imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </motion.div>
                    )}
                    
                    {/* Edit Button */}
                    {imageUrl && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ 
                          opacity: selectedImageIndex === index ? 1 : 0,
                          x: selectedImageIndex === index ? 0 : 20
                        }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-2 right-2"
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleImageEdit(index)
                          }}
                          className="bg-background/90 backdrop-blur-sm border hover:bg-background/100 transition-all"
                        >
                          <Edit3 className="w-3 h-3" />
                          Éditer
                        </Button>
                      </motion.div>
                    )}
                    
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium border">
                        Proposition {index + 1}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Generate PDF Button */}
              {selectedImageIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-2"
                >
                  <p className="text-sm text-muted-foreground">
                    Proposition {selectedImageIndex + 1} sélectionnée
                  </p>
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={isLoading}
                    size="lg"
                    className="min-w-[200px]"
                  >
                    {isLoading ? (
                      "Génération en cours..."
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Générer nouveau PDF
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          )}

          {/* PDF */}
          {order.fields.PDF?.[0]?.url && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">PDF généré</h3>
              <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
                <span className="text-sm">Proposition commerciale prête</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(order.fields.PDF?.[0]?.url, '_blank')}
                >
                  Télécharger PDF
                </Button>
              </div>
            </div>
          )}

          {/* Collection d'images */}
          {order.fields['Image collection']?.[0]?.url && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Collection d'images</h3>
              <div className="aspect-video rounded-lg border overflow-hidden bg-muted/50">
                <img
                  src={order.fields['Image collection'][0].url}
                  alt="Collection d'images"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Message si pas d'images */}
          {images.length === 0 && !order.fields.PDF?.[0]?.url && !order.fields['Image collection']?.[0]?.url && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Aucune image ou PDF généré pour cette commande</p>
            </div>
          )}
        </div>
      </DialogContent>
      
      {/* Edit Modal */}
      <EditModal
        isOpen={editModal.isOpen}
        currentImage={editModal.currentImage}
        imageIndex={editModal.imageIndex}
        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        onSubmit={handleEditSubmit}
      />
    </Dialog>
  )
}
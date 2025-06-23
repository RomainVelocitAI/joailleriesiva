"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { OrderRecord } from "@/lib/airtable"

interface ViewOrderModalProps {
  isOpen: boolean
  order: OrderRecord | null
  onClose: () => void
}

export function ViewOrderModal({ isOpen, order, onClose }: ViewOrderModalProps) {
  if (!order) return null

  const images = [
    order.fields['Image 1']?.[0]?.url,
    order.fields['Image 2']?.[0]?.url,
    order.fields['Image 3']?.[0]?.url,
    order.fields['Image 4']?.[0]?.url,
  ].filter(Boolean)

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
          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Propositions générées ({images.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((imageUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="aspect-square rounded-lg border overflow-hidden bg-muted/50">
                      <img
                        src={imageUrl}
                        alt={`Proposition ${index + 1}`}
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium border">
                        Proposition {index + 1}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
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
    </Dialog>
  )
}
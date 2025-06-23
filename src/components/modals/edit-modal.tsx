"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, Wand2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { editImageSchema, type EditImageData } from "@/lib/validations"

interface EditModalProps {
  isOpen: boolean
  currentImage: string
  imageIndex: number
  onClose: () => void
  onSubmit: (instruction: string, imageIndex: number) => Promise<void>
}

export function EditModal({ 
  isOpen, 
  currentImage, 
  imageIndex,
  onClose, 
  onSubmit 
}: EditModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<EditImageData>({
    resolver: zodResolver(editImageSchema),
    defaultValues: {
      instruction: ""
    }
  })

  const handleSubmit = async (data: EditImageData) => {
    try {
      setIsLoading(true)
      await onSubmit(data.instruction, imageIndex)
      form.reset()
      onClose()
    } catch (error) {
      console.error("Erreur lors de l'édition:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      form.reset()
      onClose()
    }
  }

  const exampleInstructions = [
    "Ajouter plus de brillance et d'éclat",
    "Modifier la couleur vers un ton plus chaud",
    "Augmenter la taille des pierres",
    "Rendre le design plus moderne",
    "Simplifier les détails décoratifs"
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Personnaliser votre création
          </DialogTitle>
          <DialogDescription>
            Décrivez les modifications que vous souhaitez apporter à cette proposition.
            Notre IA adaptera le design selon vos préférences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Preview */}
          <div className="relative">
            <div className="aspect-square rounded-lg border overflow-hidden bg-muted/50">
              <img
                src={currentImage}
                alt={`Proposition ${imageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-3 left-3">
              <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium border">
                Proposition {imageIndex + 1}
              </span>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instruction">
                Vos modifications <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="instruction"
                placeholder="Ex: Rendre les pierres plus grandes, changer la couleur vers l'or rose, simplifier les détails..."
                className="min-h-[100px] resize-none"
                {...form.register("instruction")}
                disabled={isLoading}
              />
              {form.formState.errors.instruction && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.instruction.message}
                </p>
              )}
            </div>

            {/* Quick Examples */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                Suggestions d'modifications :
              </Label>
              <div className="flex flex-wrap gap-2">
                {exampleInstructions.map((example, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => form.setValue("instruction", example)}
                    className="px-3 py-1 text-xs bg-muted hover:bg-muted/80 rounded-full border transition-colors"
                    disabled={isLoading}
                  >
                    {example}
                  </motion.button>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Modification...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Appliquer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
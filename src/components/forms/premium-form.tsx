"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { orderFormSchema, type OrderFormData, jewelryTypes } from "@/lib/validations"

interface PremiumFormProps {
  onSubmit: (data: OrderFormData & { inspirationImages?: File[] }) => void
  isLoading?: boolean
}

export function PremiumForm({ onSubmit, isLoading = false }: PremiumFormProps) {
  const [inspirationImages, setInspirationImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      boutiqueName: "",
      jewelryType: undefined,
      styleDescription: "",
      materials: "",
      otherNotes: "",
    }
  })

  const handleSubmit = (data: OrderFormData) => {
    onSubmit({ ...data, inspirationImages })
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const validFiles = Array.from(files).filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 5 * 1024 * 1024 // 5MB
      return isValidType && isValidSize
    })

    const totalFiles = inspirationImages.length + validFiles.length
    if (totalFiles > 3) {
      validFiles.splice(3 - inspirationImages.length)
    }

    setInspirationImages(prev => [...prev, ...validFiles])
  }

  const removeImage = (index: number) => {
    setInspirationImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onSubmit={form.handleSubmit(handleSubmit)}
      className="space-y-8 max-w-2xl mx-auto p-6 bg-card rounded-lg border"
    >
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-primary">Créer votre bijou sur-mesure</h1>
        <p className="text-muted-foreground">Partagez votre vision, nous la transformons en réalité</p>
      </div>

      {/* Informations personnelles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">1</span>
          Informations personnelles
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom *</Label>
            <Input
              id="firstName"
              {...form.register("firstName")}
              className="transition-all"
            />
            {form.formState.errors.firstName && (
              <p className="text-destructive text-sm">{form.formState.errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom *</Label>
            <Input
              id="lastName"
              {...form.register("lastName")}
              className="transition-all"
            />
            {form.formState.errors.lastName && (
              <p className="text-destructive text-sm">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email professionnel *</Label>
          <Input
            id="email"
            type="email"
            {...form.register("email")}
            className="transition-all"
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register("phone")}
              className="transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boutiqueName">Nom de la boutique</Label>
            <Input
              id="boutiqueName"
              {...form.register("boutiqueName")}
              className="transition-all"
            />
          </div>
        </div>
      </div>

      {/* Détails du bijou */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">2</span>
          Détails du bijou
        </h2>

        <div className="space-y-2">
          <Label htmlFor="jewelryType">Type de bijou *</Label>
          <Select onValueChange={(value) => form.setValue("jewelryType", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un type" />
            </SelectTrigger>
            <SelectContent>
              {jewelryTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.jewelryType && (
            <p className="text-destructive text-sm">{form.formState.errors.jewelryType.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="styleDescription">Style recherché *</Label>
          <Textarea
            id="styleDescription"
            placeholder="Décrivez l'univers, les émotions que doit transmettre le bijou..."
            className="min-h-[100px] resize-none transition-all"
            {...form.register("styleDescription")}
          />
          {form.formState.errors.styleDescription && (
            <p className="text-destructive text-sm">{form.formState.errors.styleDescription.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="materials">Pierres / Matériaux souhaités *</Label>
          <Input
            id="materials"
            placeholder="Ex: diamant, or blanc, saphir..."
            {...form.register("materials")}
            className="transition-all"
          />
          {form.formState.errors.materials && (
            <p className="text-destructive text-sm">{form.formState.errors.materials.message}</p>
          )}
        </div>
      </div>

      {/* Images d'inspiration */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">3</span>
          Images d'inspiration (1-3 images)
        </h2>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Glissez vos images ici ou cliquez pour parcourir
          </p>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="file-upload"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            Parcourir les fichiers
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            JPG, PNG - Maximum 5MB par image
          </p>
        </div>

        {inspirationImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {inspirationImages.map((file, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Inspiration ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Autres précisions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">4</span>
          Finalisation
        </h2>

        <div className="space-y-2">
          <Label htmlFor="otherNotes">Autres précisions</Label>
          <Textarea
            id="otherNotes"
            placeholder="Toute information complémentaire..."
            className="min-h-[80px] resize-none transition-all"
            {...form.register("otherNotes")}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-lg font-semibold transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Génération en cours...
          </>
        ) : (
          "Générer mes propositions"
        )}
      </Button>
    </motion.form>
  )
}
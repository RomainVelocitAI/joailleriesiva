"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CardSelectProps {
  image: string
  isSelected: boolean
  onSelect: () => void
  onEdit: () => void
  index: number
  isLoading?: boolean
}

export function CardSelect({ 
  image, 
  isSelected, 
  onSelect, 
  onEdit, 
  index,
  isLoading = false 
}: CardSelectProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1, ease: "easeOut" }}
      className="relative group"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border-2 cursor-pointer transition-all duration-200",
          isSelected 
            ? "border-primary shadow-lg shadow-primary/25 ring-1 ring-primary/50" 
            : "border-border hover:border-primary/50",
          isLoading && "opacity-50 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
      >
        {/* Image Container */}
        <div className="aspect-square relative">
          <img
            src={image}
            alt={`Proposition ${index + 1}`}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
          
          {/* Overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/0 transition-all duration-200",
            (isHovered || isSelected) && "bg-black/20"
          )} />
          
          {/* Selection Indicator */}
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
        </div>

        {/* Edit Button */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: isHovered || isSelected ? 1 : 0,
            x: isHovered || isSelected ? 0 : 20
          }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-3 right-3"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="bg-background/90 backdrop-blur-sm border hover:bg-background/100 transition-all"
          >
            <Edit3 className="w-3 h-3" />
            Éditer
          </Button>
        </motion.div>

        {/* Card Label */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-background/90 backdrop-blur-sm rounded-md text-xs font-medium border">
            Proposition {index + 1}
          </span>
        </div>
      </div>

      {/* Selection Radio (Hidden) */}
      <input
        type="radio"
        name="selected-image"
        className="sr-only"
        checked={isSelected}
        onChange={onSelect}
      />
    </motion.div>
  )
}

interface ImageGridProps {
  images: string[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  onEdit: (index: number) => void
  isLoading?: boolean
}

export function ImageGrid({ 
  images, 
  selectedIndex, 
  onSelect, 
  onEdit,
  isLoading = false 
}: ImageGridProps) {
  if (images.length === 0) return null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Vos propositions sur-mesure</h2>
        <p className="text-muted-foreground">
          Sélectionnez votre création préférée et personnalisez-la selon vos envies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {images.map((image, index) => (
          <CardSelect
            key={index}
            image={image}
            isSelected={selectedIndex === index}
            onSelect={() => onSelect(index)}
            onEdit={() => onEdit(index)}
            index={index}
            isLoading={isLoading}
          />
        ))}
      </div>

      {selectedIndex !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Proposition {selectedIndex + 1} sélectionnée
          </p>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(selectedIndex)}
            >
              <Edit3 className="w-3 h-3" />
              Modifier cette proposition
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
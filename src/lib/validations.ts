import { z } from "zod"

export const jewelryTypes = [
  "Bague",
  "Collier", 
  "Bracelet",
  "Boucles d'oreilles",
  "Pendentif",
  "Autre"
] as const

// Schema de base pour la production
const baseOrderSchema = z.object({
  // Champs obligatoires
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez saisir une adresse email valide"),
  
  // Champs optionnels
  phone: z.string().optional(),
  boutiqueName: z.string().optional(),
  
  // Champs métier
  jewelryType: z.enum(jewelryTypes, {
    required_error: "Veuillez sélectionner un type de bijou"
  }),
  styleDescription: z.string().min(1, "Veuillez décrire le style souhaité"),
  materials: z.string().min(1, "Veuillez préciser les matériaux souhaités"),
  otherNotes: z.string().optional(),
  
  // Images d'inspiration (gérées séparément côté composant)
  inspirationImages: z.array(z.instanceof(File)).max(3, "Maximum 3 images").optional()
})

// Schema avec validation renforcée pour la production
const strictOrderSchema = baseOrderSchema.extend({
  styleDescription: z.string().min(10, "Veuillez décrire le style souhaité (minimum 10 caractères)"),
  materials: z.string().min(3, "Veuillez préciser les matériaux souhaités (minimum 3 caractères)"),
})

// Utilisation du schema approprié selon l'environnement
export const orderFormSchema = process.env.NODE_ENV === 'development' ? baseOrderSchema : strictOrderSchema

export type OrderFormData = z.infer<typeof orderFormSchema>

export const editImageSchema = z.object({
  instruction: z.string().min(5, "Veuillez préciser vos modifications (minimum 5 caractères)")
})

export type EditImageData = z.infer<typeof editImageSchema>
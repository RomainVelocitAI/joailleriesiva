"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { OrdersTable } from "@/components/history/orders-table"
import { OrderRecord } from "@/lib/airtable"

export default function HistoriquePage() {
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDownload = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    const pdfUrl = order?.fields.PDF?.[0]?.url
    
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const handleDelete = async (orderId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setOrders(prev => prev.filter(order => order.id !== orderId))
        }
      } catch (error) {
        console.error('Error deleting order:', error)
      }
    }
  }

  const handleSend = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId)
    const email = order?.fields.email
    
    if (!email) {
      alert('Aucun email trouvé pour cette commande')
      return
    }

    try {
      const response = await fetch('/api/webhooks/send-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          recipientEmail: email
        })
      })

      if (response.ok) {
        alert('Proposition envoyée avec succès!')
        fetchOrders() // Refresh pour mettre à jour le statut
      } else {
        alert('Erreur lors de l\'envoi')
      }
    } catch (error) {
      console.error('Error sending proposal:', error)
      alert('Erreur lors de l\'envoi')
    }
  }

  const handleView = (orderId: string) => {
    // TODO: Implémenter la vue détaillée d'une commande
    console.log('View order:', orderId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement de l'historique...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Historique des commandes</h1>
              <p className="text-muted-foreground">
                Gérez vos propositions et suivez l'état de vos commandes
              </p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </motion.div>

        {/* Orders Table */}
        <OrdersTable
          orders={orders}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onSend={handleSend}
          onView={handleView}
        />
      </div>
    </div>
  )
}
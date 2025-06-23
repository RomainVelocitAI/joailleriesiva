"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { 
  Download, 
  Trash2, 
  Send, 
  Eye, 
  MoreHorizontal,
  Calendar,
  User,
  ArrowUpDown
} from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { OrderRecord } from "@/lib/airtable"

interface OrdersTableProps {
  orders: OrderRecord[]
  onDownload: (orderId: string) => void
  onDelete: (orderId: string) => void
  onSend: (orderId: string) => void
  onView: (orderId: string) => void
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'generating':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
    case 'images_ready':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    case 'pdf_ready':
      return 'bg-green-500/10 text-green-600 border-green-500/20'
    case 'sent':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20'
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'generating':
      return 'En cours'
    case 'images_ready':
      return 'Images prêtes'
    case 'pdf_ready':
      return 'PDF prêt'
    case 'sent':
      return 'Envoyé'
    default:
      return 'Inconnu'
  }
}

export function OrdersTable({ 
  orders, 
  onDownload, 
  onDelete, 
  onSend, 
  onView 
}: OrdersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<OrderRecord>[] = [
    {
      accessorKey: "fields.Client",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            <User className="mr-2 h-4 w-4" />
            Client
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "fields.Email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.original.fields.Email
        return email || '-'
      },
    },
    {
      accessorKey: "fields.Demande",
      header: "Demande",
      cell: ({ row }) => {
        const demande = row.original.fields.Demande
        return demande ? demande.substring(0, 50) + '...' : '-'
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original
        const hasPDF = !!order.fields.PDF?.[0]?.url
        const hasImages = !!(order.fields['Image 1']?.[0]?.url)
        
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(order.id)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {hasPDF && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDownload(order.id)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            
            {hasImages && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSend(order.id)}
                className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(order.id)}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Aucune commande</h3>
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas encore de commandes dans votre historique.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Aucun résultat.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} commande(s) au total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
"use client"

import {
  AlertCircle,
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  CreditCard,
  Database,
  DollarSign,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Trash2,
  User,
  XCircle,
} from "lucide-react"
import { useCallback, useRef, useState } from "react"

// Mock data for demonstration
const MOCK_ITEMS = [
  {
    id: "1",
    name: "Coffee - Large",
    price: 4.99,
    sku: "COF-L-001",
    inventoryLevel: { quantityOnHand: 50, reorderPoint: 10 },
  },
  {
    id: "2",
    name: "Sandwich - Club",
    price: 8.99,
    sku: "SND-CLB-001",
    inventoryLevel: { quantityOnHand: 5, reorderPoint: 8 },
  },
  {
    id: "3",
    name: "Pastry - Croissant",
    price: 3.49,
    sku: "PST-CRS-001",
    inventoryLevel: { quantityOnHand: 2, reorderPoint: 5 },
  },
  {
    id: "4",
    name: "Tea - Earl Grey",
    price: 2.99,
    sku: "TEA-EG-001",
    inventoryLevel: { quantityOnHand: 0, reorderPoint: 10 },
  },
]

// Toast Notification System
// Toast types
import type { ReactNode } from "react"

type ToastAction = {
  label: string
  onClick: () => void
}

type ToastType = "success" | "error" | "warning" | "info" | "loading"

type Toast = {
  id: number
  type: ToastType
  title: string
  description: string
  icon: ReactNode
  duration?: number
  action?: ToastAction
}

type ToastContainerProps = {
  toasts: Toast[]
  removeToast: (id: number) => void
}

export const ToastContainer = ({ toasts, removeToast }: ToastContainerProps) => (
  <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`
          p-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-full
          ${toast.type === "success" ? "bg-green-50 border-green-500 text-green-800" : ""}
          ${toast.type === "error" ? "bg-red-50 border-red-500 text-red-800" : ""}
          ${toast.type === "warning" ? "bg-yellow-50 border-yellow-500 text-yellow-800" : ""}
          ${toast.type === "info" ? "bg-blue-50 border-blue-500 text-blue-800" : ""}
          ${toast.type === "loading" ? "bg-gray-50 border-gray-500 text-gray-800" : ""}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">{toast.icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold">{toast.title}</h4>
            <p className="text-sm mt-1 opacity-90">{toast.description}</p>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-xs px-2 py-1 rounded bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    ))}
  </div>
)

// Custom toast hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = ++toastId.current
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration || 4000)
    }

    return id
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
  }, [])

  return { toasts, addToast, removeToast, dismissAll }
}

// Toast notification functions
export const createToastFunctions = (addToast: (toast: Omit<Toast, "id">) => number) => ({
  // Session Management Toasts
  sessionStart: (sessionNumber: string | number, openingBalance: number) => {
    addToast({
      type: "success",
      title: "POS Session Started",
      description: `Session ${sessionNumber} active with $${openingBalance.toFixed(2)} opening balance`,
      icon: <Store className="h-4 w-4" />,
      duration: 4000,
    })
  },

  sessionEnd: (sessionNumber: string | number, totalSales: number, transactionCount: number) => {
    addToast({
      type: "success",
      title: "Session Closed Successfully",
      description: `${sessionNumber}: $${totalSales.toFixed(2)} • ${transactionCount} transactions`,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 6000,
    })
  },

  sessionRequired: () => {
    addToast({
      type: "warning",
      title: "Session Required",
      description: "Start a POS session before processing transactions",
      icon: <AlertCircle className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "Start Session",
        onClick: () => console.log("Start session clicked"),
      },
    })
  },

  sessionLoading: () => {
    return addToast({
      type: "loading",
      title: "Checking Session Status",
      description: "Verifying active POS session...",
      icon: <Clock className="h-4 w-4" />,
      duration: 0,
    })
  },

  sessionFound: (sessionNumber: string | number) => {
    addToast({
      type: "success",
      title: "Active Session Found",
      description: `Continuing with session ${sessionNumber}`,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 2500,
    })
  },

  // Cart Management Toasts
  itemAdded: (itemName: string, quantity: number, price: number) => {
    addToast({
      type: "success",
      title: "Item Added to Cart",
      description: `${quantity}x ${itemName} • $${(price * quantity).toFixed(2)}`,
      icon: <ShoppingCart className="h-4 w-4" />,
      duration: 2500,
    })
  },

  itemQuantityUpdated: (itemName: string, oldQty: number, newQty: number) => {
    const change = newQty > oldQty ? "increased" : "decreased"
    addToast({
      type: "info",
      title: "Quantity Updated",
      description: `${itemName} ${change} from ${oldQty} to ${newQty}`,
      icon: <Package className="h-4 w-4" />,
      duration: 2000,
    })
  },

  itemRemoved: (itemName: string, quantity: number, amount: number) => {
    addToast({
      type: "success",
      title: "Item Removed",
      description: `${quantity}x ${itemName} removed • -$${amount.toFixed(2)}`,
      icon: <Trash2 className="h-4 w-4" />,
      duration: 2500,
    })
  },

  cartCleared: (itemCount: number, totalAmount: number) => {
    addToast({
      type: "success",
      title: "Cart Cleared",
      description: `${itemCount} items removed • -$${totalAmount.toFixed(2)}`,
      icon: <Trash2 className="h-4 w-4" />,
      duration: 3000,
    })
  },

  emptyCart: () => {
    addToast({
      type: "warning",
      title: "Empty Cart",
      description: "Add items to proceed with transaction",
      icon: <ShoppingCart className="h-4 w-4" />,
      duration: 3000,
    })
  },

  // Inventory Toasts
  lowStock: (itemName: string, remaining: number, threshold: number) => {
    addToast({
      type: "warning",
      title: "Low Stock Alert",
      description: `${itemName}: ${remaining} left (below ${threshold})`,
      icon: <Package className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "View Details",
        onClick: () => console.log("View stock details"),
      },
    })
  },

  outOfStock: (itemName: string) => {
    addToast({
      type: "error",
      title: "Out of Stock",
      description: `${itemName} is unavailable`,
      icon: <XCircle className="h-4 w-4" />,
      duration: 4000,
    })
  },

  inventoryUpdated: (updateCount: number) => {
    addToast({
      type: "success",
      title: "Inventory Updated",
      description: `${updateCount} item level${updateCount > 1 ? "s" : ""} updated`,
      icon: <Database className="h-4 w-4" />,
      duration: 2500,
    })
  },

  // Payment Toasts
  paymentInitiating: (method: string, amount: number) => {
    return addToast({
      type: "loading",
      title: "Processing Payment",
      description: `${method}: $${amount.toFixed(2)}`,
      icon: <CreditCard className="h-4 w-4" />,
      duration: 0,
    })
  },

  paymentSuccess: (method: string, amount: number, change?: number, receiptNumber?: string | number) => {
    let description = `${method}: $${amount.toFixed(2)} processed`
    if (change && change > 0) description += ` • Change: $${change.toFixed(2)}`
    if (receiptNumber) description += ` • ${receiptNumber}`

    addToast({
      type: "success",
      title: "Payment Complete!",
      description,
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "Print Receipt",
        onClick: () => console.log("Print receipt"),
      },
    })
  },

  paymentFailed: (method: string, error: string) => {
    addToast({
      type: "error",
      title: "Payment Failed",
      description: `${method}: ${error}`,
      icon: <XCircle className="h-4 w-4" />,
      duration: 6000,
      action: {
        label: "Try Again",
        onClick: () => console.log("Retry payment"),
      },
    })
  },

  insufficientPayment: (tendered: number, required: number, difference: number) => {
    addToast({
      type: "error",
      title: "Insufficient Payment",
      description: `Need $${difference.toFixed(2)} more ($${tendered.toFixed(2)} of $${required.toFixed(2)})`,
      icon: <Banknote className="h-4 w-4" />,
      duration: 4000,
    })
  },

  excessPayment: (tendered: number, change: number) => {
    addToast({
      type: "info",
      title: "Change Due",
      description: `$${tendered.toFixed(2)} tendered • Change: $${change.toFixed(2)}`,
      icon: <DollarSign className="h-4 w-4" />,
      duration: 4000,
    })
  },

  // Receipt Toasts
  receiptGenerated: (receiptNumber: string | number) => {
    addToast({
      type: "success",
      title: "Receipt Ready",
      description: `Receipt ${receiptNumber} generated`,
      icon: <Receipt className="h-4 w-4" />,
      duration: 2500,
      action: {
        label: "Print",
        onClick: () => console.log("Print receipt"),
      },
    })
  },

  // System Toasts
  welcomeMessage: (userName: string) => {
    addToast({
      type: "success",
      title: `Welcome back, ${userName}!`,
      description: "Ready to start serving customers",
      icon: <User className="h-4 w-4" />,
      duration: 3000,
    })
  },

  serverError: (action: string) => {
    addToast({
      type: "error",
      title: "Server Error",
      description: `Unable to ${action}. Please try again.`,
      icon: <AlertTriangle className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: "Retry",
        onClick: () => console.log("Retry action"),
      },
    })
  },
})

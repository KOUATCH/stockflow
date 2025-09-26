"use client"

import { useToast } from "@/hooks/use-toast"

export function useEnhancedNotifications() {
  const { toast } = useToast()

  return {
    // Session Management Notifications
    sessionStart: (sessionNumber: string, openingBalance: number) => {
      toast({
        title: "🎉 POS Session Started",
        description: `Session ${sessionNumber} active with $${openingBalance.toFixed(2)} opening balance`,
        variant: "default",
      })
    },

    sessionEnd: (sessionNumber: string, totalSales: number, transactionCount: number, variance?: number) => {
      const isBalanced = variance !== undefined && Math.abs(variance) < 0.01
      toast({
        title: isBalanced ? "✅ Session Closed Successfully" : "⚠️ Session Closed with Variance",
        description: `${sessionNumber}: $${totalSales.toFixed(2)} • ${transactionCount} transactions${variance !== undefined ? ` • Variance: ${variance >= 0 ? "+" : ""}$${variance.toFixed(2)}` : ""}`,
        variant: isBalanced ? "default" : "destructive",
      })
    },

    sessionRequired: () => {
      toast({
        title: "⚠️ Session Required",
        description: "Start a POS session before processing transactions",
        variant: "destructive",
      })
    },

    sessionLoading: () => {
      toast({
        title: "🔄 Checking Session Status",
        description: "Verifying active POS session...",
        variant: "default",
      })
    },

    sessionFound: (sessionNumber: string) => {
      toast({
        title: "✅ Active Session Found",
        description: `Continuing with session ${sessionNumber}`,
        variant: "default",
      })
    },

    sessionSuspended: (sessionNumber: string) => {
      toast({
        title: "⏸️ Session Suspended",
        description: `Session ${sessionNumber} has been paused`,
        variant: "default",
      })
    },

    sessionResumed: (sessionNumber: string) => {
      toast({
        title: "▶️ Session Resumed",
        description: `Session ${sessionNumber} is now active`,
        variant: "default",
      })
    },

    // Cart Management Notifications
    itemAdded: (itemName: string, quantity: number, price: number) => {
      toast({
        title: "🛒 Item Added to Cart",
        description: `${quantity}x ${itemName} • $${(price * quantity).toFixed(2)}`,
        variant: "default",
      })
    },

    itemRemoved: (itemName: string, quantity: number, amount: number) => {
      toast({
        title: "🗑️ Item Removed",
        description: `${quantity}x ${itemName} removed • -$${amount.toFixed(2)}`,
        variant: "default",
      })
    },

    cartCleared: (itemCount: number, totalAmount: number) => {
      toast({
        title: "🧹 Cart Cleared",
        description: `${itemCount} items removed • -$${totalAmount.toFixed(2)}`,
        variant: "default",
      })
    },

    // Payment Notifications
    paymentSuccess: (method: string, amount: number, change?: number, receiptNumber?: string) => {
      let description = `${method}: $${amount.toFixed(2)} processed`
      if (change && change > 0) description += ` • Change: $${change.toFixed(2)}`
      if (receiptNumber) description += ` • ${receiptNumber}`

      toast({
        title: "💳 Payment Complete!",
        description,
        variant: "default",
      })
    },

    paymentFailed: (method: string, error: string) => {
      toast({
        title: "❌ Payment Failed",
        description: `${method}: ${error}`,
        variant: "destructive",
      })
    },

    insufficientPayment: (tendered: number, required: number, difference: number) => {
      toast({
        title: "💰 Insufficient Payment",
        description: `Need $${difference.toFixed(2)} more ($${tendered.toFixed(2)} of $${required.toFixed(2)})`,
        variant: "destructive",
      })
    },

    // Inventory Notifications
    lowStock: (itemName: string, remaining: number, threshold: number) => {
      toast({
        title: "📦 Low Stock Alert",
        description: `${itemName}: ${remaining} left (below ${threshold})`,
        variant: "destructive",
      })
    },

    outOfStock: (itemName: string) => {
      toast({
        title: "❌ Out of Stock",
        description: `${itemName} is unavailable`,
        variant: "destructive",
      })
    },

    // System Notifications
    welcomeMessage: (userName: string) => {
      toast({
        title: `👋 Welcome back, ${userName}!`,
        description: "Ready to start serving customers",
        variant: "default",
      })
    },

    serverError: (action: string) => {
      toast({
        title: "🚨 Server Error",
        description: `Unable to ${action}. Please try again.`,
        variant: "destructive",
      })
    },

    networkError: () => {
      toast({
        title: "🌐 Network Error",
        description: "Connection lost. Please check your internet connection.",
        variant: "destructive",
      })
    },

    // Cash Drawer Notifications
    drawerOpened: (balance: number) => {
      toast({
        title: "💰 Cash Drawer Opened",
        description: `Current balance: $${balance.toFixed(2)}`,
        variant: "default",
      })
    },

    drawerClosed: (finalBalance: number) => {
      toast({
        title: "🔒 Cash Drawer Closed",
        description: `Final balance: $${finalBalance.toFixed(2)}`,
        variant: "default",
      })
    },

    variance: (variance: number) => {
      const isOver = variance > 0
      toast({
        title: isOver ? "💰 Cash Overage" : "⚠️ Cash Shortage",
        description: `Variance: ${isOver ? "+" : ""}$${variance.toFixed(2)}`,
        variant: Math.abs(variance) > 5 ? "destructive" : "default",
      })
    },
  }
}

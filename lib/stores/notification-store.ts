import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import type { ReactNode } from "react"

export type ToastType = "success" | "error" | "warning" | "info" | "loading"

export type ToastAction = {
  label: string
  onClick: () => void
}

export type Toast = {
  id: string
  type: ToastType
  title: string
  description: string
  icon: ReactNode
  duration?: number
  action?: ToastAction
  persistent?: boolean
}

interface NotificationState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  dismissAll: () => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    toasts: [],

    addToast: (toast) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newToast = { ...toast, id }

      set((state) => ({
        toasts: [...state.toasts, newToast],
      }))

      // Auto-remove toast unless persistent or duration is 0
      if (!toast.persistent && toast.duration !== 0) {
        setTimeout(() => {
          get().removeToast(id)
        }, toast.duration || 4000)
      }

      return id
    },

    removeToast: (id) => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    },

    dismissAll: () => {
      set({ toasts: [] })
    },

    updateToast: (id, updates) => {
      set((state) => ({
        toasts: state.toasts.map((toast) => (toast.id === id ? { ...toast, ...updates } : toast)),
      }))
    },
  })),
)

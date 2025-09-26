"use client"

import { useNotificationStore } from "@/lib/stores/notification-store"
import { XCircle } from "lucide-react"

export function ToastContainer() {
  const { toasts, removeToast } = useNotificationStore()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-full backdrop-blur-sm
            ${toast.type === "success" ? "bg-green-50/95 border-green-500 text-green-800" : ""}
            ${toast.type === "error" ? "bg-red-50/95 border-red-500 text-red-800" : ""}
            ${toast.type === "warning" ? "bg-yellow-50/95 border-yellow-500 text-yellow-800" : ""}
            ${toast.type === "info" ? "bg-blue-50/95 border-blue-500 text-blue-800" : ""}
            ${toast.type === "loading" ? "bg-gray-50/95 border-gray-500 text-gray-800" : ""}
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
                  className="mt-2 text-xs px-3 py-1 rounded bg-white/30 hover:bg-white/40 transition-colors font-medium"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

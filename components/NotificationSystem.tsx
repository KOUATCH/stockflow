"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, Info, Volume2, VolumeX, X } from "lucide-react"
import { useEffect, useState } from "react"

export interface NotificationData {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  duration?: number
  sound?: boolean
  priority?: "low" | "normal" | "high"
  category?: string
  showProgress?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationSystemProps {
  notifications: NotificationData[]
  onRemove: (id: string) => void
  soundEnabled: boolean
  onToggleSound: () => void
}

const NotificationIcon = ({ type }: { type: NotificationData["type"] }) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5" />
    case "error":
      return <AlertTriangle className="h-5 w-5" />
    case "warning":
      return <AlertTriangle className="h-5 w-5" />
    case "info":
    default:
      return <Info className="h-5 w-5" />
  }
}

const getNotificationStyles = (type: NotificationData["type"]) => {
  switch (type) {
    case "success":
      return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800"
    case "error":
      return "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 text-red-800"
    case "warning":
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800"
    case "info":
    default:
      return "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-800"
  }
}

const getIconStyles = (type: NotificationData["type"]) => {
  switch (type) {
    case "success":
      return "text-green-600 bg-green-100"
    case "error":
      return "text-red-600 bg-red-100"
    case "warning":
      return "text-yellow-600 bg-yellow-100"
    case "info":
    default:
      return "text-blue-600 bg-blue-100"
  }
}

export function NotificationSystem({ notifications, onRemove, soundEnabled, onToggleSound }: NotificationSystemProps) {
  const [soundsPlayed, setSoundsPlayed] = useState<Set<string>>(new Set())

  useEffect(() => {
    notifications.forEach((notification) => {
      if (soundEnabled && notification.sound && !soundsPlayed.has(notification.id)) {
        playNotificationSound(notification.type)
        setSoundsPlayed((prev) => new Set(prev).add(notification.id))
      }
    })
  }, [notifications, soundEnabled, soundsPlayed])

  const playNotificationSound = (type: NotificationData["type"]) => {
    // Create audio context for different notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Different frequencies for different notification types
    switch (type) {
      case "success":
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        break
      case "error":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1)
        break
      case "warning":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        break
      case "info":
      default:
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime)
        break
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }

  return (
    <>
      {/* Sound Toggle Button */}
      <div className="fixed top-4 right-20 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSound}
          className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-green-600" />
          ) : (
            <VolumeX className="h-4 w-4 text-gray-400" />
          )}
        </Button>
      </div>

      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} onRemove={onRemove} />
        ))}
      </div>
    </>
  )
}

function NotificationCard({
  notification,
  onRemove,
}: {
  notification: NotificationData
  onRemove: (id: string) => void
}) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRemove()
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.duration])

  const handleRemove = () => {
    setIsExiting(true)
    setTimeout(() => {
      onRemove(notification.id)
    }, 300)
  }

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm transition-all duration-300",
        getNotificationStyles(notification.type),
        isExiting ? "notification-exit" : "notification-enter",
        notification.type === "success" && "pulse-success",
        notification.type === "error" && "pulse-error",
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-full", getIconStyles(notification.type))}>
          <NotificationIcon type={notification.type} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
          <p className="text-sm opacity-90">{notification.message}</p>

          {notification.action && (
            <Button
              variant="outline"
              size="sm"
              className="mt-2 h-7 text-xs bg-transparent"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          )}
        </div>

        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-60 hover:opacity-100" onClick={handleRemove}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

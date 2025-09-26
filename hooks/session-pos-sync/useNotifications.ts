// "use client"

// import { NotificationData } from "@/components/synchro/NotificationSystem"
// import { useCallback, useState } from "react"

// export function useNotification() {
//   const [notifications, setNotifications] = useState<NotificationData[]>([])
//   const [soundEnabled, setSoundEnabled] = useState(true)

//   const addNotification = useCallback((notification: Omit<NotificationData, "id">) => {
//     const id = Math.random().toString(36).substr(2, 9)
//     const newNotification: NotificationData = {
//       id,
//       sound: true,
//       duration: 5000,
//       ...notification,
//     }

//     setNotifications((prev) => [...prev, newNotification])
//     return id
//   }, [])

//   const removeNotification = useCallback((id: string) => {
//     setNotifications((prev) => prev.filter((n) => n.id !== id))
//   }, [])

//   const clearAll = useCallback(() => {
//     setNotifications([])
//   }, [])

//   const toggleSound = useCallback(() => {
//     setSoundEnabled((prev) => !prev)
//   }, [])

//   // Convenience methods for different notification types
//   const success = useCallback(
//     (title: string, message: string, options?: Partial<NotificationData>) => {
//       return addNotification({ type: "success", title, message, ...options })
//     },
//     [addNotification],
//   )

//   const error = useCallback(
//     (title: string, message: string, options?: Partial<NotificationData>) => {
//       return addNotification({ type: "error", title, message, ...options })
//     },
//     [addNotification],
//   )

//   const warning = useCallback(
//     (title: string, message: string, options?: Partial<NotificationData>) => {
//       return addNotification({ type: "warning", title, message, ...options })
//     },
//     [addNotification],
//   )

//   const info = useCallback(
//     (title: string, message: string, options?: Partial<NotificationData>) => {
//       return addNotification({ type: "info", title, message, ...options })
//     },
//     [addNotification],
//   )

//   return {
//     notifications,
//     soundEnabled,
//     addNotification,
//     removeNotification,
//     clearAll,
//     toggleSound,
//     success,
//     error,
//     warning,
//     info,
//   }
// }

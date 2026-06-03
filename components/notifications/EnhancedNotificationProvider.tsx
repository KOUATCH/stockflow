"use client"

import { NotificationProvider, useNotifications } from "./NotificationProvider"

export { NotificationProvider as EnhancedNotificationProvider }

export function useEnhancedNotifications() {
  const notifications = useNotifications()

  return {
    ...notifications,
    businessSuccess: (title: string, message: string) => notifications.success(title, message, { category: "business" }),
    businessError: (title: string, message: string) => notifications.error(title, message, { category: "business" }),
    businessWarning: (title: string, message: string) => notifications.warning(title, message, { category: "business" }),
    businessInfo: (title: string, message: string) => notifications.info(title, message, { category: "business" }),
  }
}

export default NotificationProvider

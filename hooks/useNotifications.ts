"use client"

import { useNotifications as useProviderNotifications } from "@/components/notifications/NotificationProvider"

export const useNotifications = useProviderNotifications

export function useNotification() {
  return useProviderNotifications()
}

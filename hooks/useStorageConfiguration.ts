"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import {
  getStorageConfiguration,
  updateStorageConfiguration,
  initializeStorageForOrganization
} from '@/actions/storage/storage-config-actions'
import { StorageType } from '@/types/storage'

// Query keys
export const storageQueryKeys = {
  configuration: (organizationId: string) => ['storage-configuration', organizationId],
  all: ['storage-configuration'],
}

// Hook for fetching storage configuration
export function useStorageConfiguration(organizationId: string) {
  return useQuery({
    queryKey: storageQueryKeys.configuration(organizationId),
    queryFn: async () => {
      console.log('🎣 useStorageConfiguration querying for organizationId:', organizationId)

      if (!organizationId) {
        throw new Error('Organization ID is required')
      }

      const result = await getStorageConfiguration(organizationId)
      console.log('🎣 getStorageConfiguration result:', result)

      if (!result.success) {
        console.error('🎣 Query failed:', result.error)
        throw new Error(result.error || 'Failed to fetch storage configuration')
      }

      console.log('🎣 Query successful, returning data:', result.data ? 'Config found' : 'No config')
      return result.data
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error) => {
      console.log(`🎣 Query failed ${failureCount} times:`, error.message)
      return failureCount < 2 // Retry up to 2 times
    },
  })
}

// Hook for updating storage configuration
export function useUpdateStorageConfiguration() {
  const queryClient = useQueryClient()
  const notification = useNotifications()

  return useMutation({
    meta: { operation: 'update', entity: 'Storage Configuration' , suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async ({
      organizationId,
      storageType,
      localStoragePath,
      maxFileSize,
      allowedFileTypes
    }: {
      organizationId: string
      storageType: StorageType
      localStoragePath?: string
      maxFileSize?: number
      allowedFileTypes?: string[]
    }) => {
      console.log('🔧 useUpdateStorageConfiguration mutation called with:', {
        organizationId,
        storageType,
        localStoragePath,
        maxFileSize,
        allowedFileTypes
      })

      const result = await updateStorageConfiguration(
        organizationId,
        storageType as 'local' | 'online', // Ensure type compatibility
        localStoragePath,
        maxFileSize,
        allowedFileTypes
      )

      console.log('🔧 updateStorageConfiguration mutation result:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to update storage configuration')
      }

      return result.data
    },
    onSuccess: (data, variables) => {
      console.log('🔧 Update mutation successful, invalidating queries')
      // Invalidate and refetch storage configuration
      queryClient.invalidateQueries({
        queryKey: storageQueryKeys.configuration(variables.organizationId)
      })

      notification.formSuccess(
        "Storage Configuration",
        `${variables.storageType} storage settings updated successfully`
      )
    },
    onError: (error: Error) => {
      console.error('🔧 Update mutation failed:', error)
      notification.formError(
        "Storage Configuration",
        error.message || "Failed to update storage configuration"
      )
    },
  })
}

// Hook for initializing storage configuration
export function useInitializeStorageConfiguration() {
  const queryClient = useQueryClient()
  const notification = useNotifications()

  return useMutation({
    meta: { operation: 'create', entity: 'Storage Configuration', suppressSuccessNotification: true, suppressErrorNotification: true },
    mutationFn: async (organizationId: string) => {
      console.log('🚀 useInitializeStorageConfiguration mutation called with:', organizationId)

      const result = await initializeStorageForOrganization(organizationId)
      console.log('🚀 initializeStorageForOrganization mutation result:', result)

      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize storage configuration')
      }

      return result.data
    },
    onSuccess: (data, organizationId) => {
      console.log('🚀 Initialize mutation successful, invalidating queries')
      // Invalidate and refetch storage configuration
      queryClient.invalidateQueries({
        queryKey: storageQueryKeys.configuration(organizationId)
      })

      // Only show notification if a new configuration was created (not if it already existed)
      if (data && !data.alreadyExists) {
        notification.operationComplete(
          "Storage Configuration Initialized",
          "Default storage settings have been configured"
        )
      }
    },
    onError: (error: Error) => {
      console.error('🚀 Initialize mutation failed:', error)
      notification.formError(
        "Storage Initialization",
        error.message || "Failed to initialize storage configuration"
      )
    },
  })
}
"use server"

import { revalidatePath } from 'next/cache'
import { db } from '@/prisma/db'
import { StorageType } from '@/types/storage'

export async function getStorageConfiguration(organizationId: string) {
  try {
    console.log('🔍 getStorageConfiguration called with organizationId:', organizationId)

    if (!organizationId) {
      console.log('❌ No organizationId provided')
      return { success: false, error: 'Organization ID is required' }
    }

    const config = await db.photoStorageSettings.findUnique({
      where: { organizationId }
    })

    console.log('🗄️ Database query result:', config ? 'Found config' : 'No config found')
    return { success: true, data: config }
  } catch (error) {
    console.error('❌ Error fetching storage configuration:', error)
    return { success: false, error: 'Failed to fetch storage configuration' }
  }
}

export async function updateStorageConfiguration(
  organizationId: string,
  storageType: StorageType,
  localStoragePath?: string,
  maxFileSize?: number,
  allowedFileTypes?: string[]
) {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' }
    }

    if (!storageType || (storageType !== 'local' && storageType !== 'online')) {
      return { success: false, error: 'Valid storage type (local or online) is required' }
    }

    const data = {
      organizationId,
      storageType,
      localStoragePath: localStoragePath || '/public/uploads',
      maxFileSize: maxFileSize || 1024 * 1024, // 1MB default
      allowedFileTypes: allowedFileTypes || ['image/jpeg', 'image/png', 'image/gif'],
    }

    const config = await db.photoStorageSettings.upsert({
      where: { organizationId },
      update: {
        storageType,
        localStoragePath: data.localStoragePath,
        maxFileSize: data.maxFileSize,
        allowedFileTypes: data.allowedFileTypes,
        updatedAt: new Date(),
      },
      create: {
        ...data,
        id: `storage_${organizationId}_${Date.now()}`,
      }
    })

    revalidatePath('/dashboard/settings')
    revalidatePath('/dashboard/settings/company')
    return { success: true, data: config }
  } catch (error) {
    console.error('Error updating storage configuration:', error)
    return { success: false, error: 'Failed to update storage configuration' }
  }
}

export async function initializeStorageForOrganization(organizationId: string) {
  try {
    if (!organizationId) {
      return { success: false, error: 'Organization ID is required' }
    }

    // First verify the organization exists
    const organizationExists = await db.organization.findUnique({
      where: { id: organizationId }
    })

    if (!organizationExists) {
      return { success: false, error: 'Organization not found' }
    }

    const existingConfig = await db.photoStorageSettings.findUnique({
      where: { organizationId }
    })

    if (!existingConfig) {
      // Create default configuration
      const result = await updateStorageConfiguration(organizationId, 'online')
      if (!result.success) {
        return result
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error initializing storage for organization:', error)
    return { success: false, error: 'Failed to initialize storage configuration' }
  }
}
import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { StorageConfiguration, StorageType } from '@/types/storage'

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
}

export class PhotoStorageManager {
  private static instance: PhotoStorageManager
  private storageConfig: StorageConfiguration | null = null

  private constructor() {}

  static getInstance(): PhotoStorageManager {
    if (!PhotoStorageManager.instance) {
      PhotoStorageManager.instance = new PhotoStorageManager()
    }
    return PhotoStorageManager.instance
  }

  async setConfiguration(config: StorageConfiguration) {
    this.storageConfig = config

    if (config.type === 'local' && config.localPath) {
      // Ensure the local directory exists
      await this.ensureDirectoryExists(config.localPath)
    }
  }

  async savePhoto(file: File, organizationId: string): Promise<string> {
    if (!this.storageConfig) {
      throw new Error('Storage configuration not set')
    }

    if (this.storageConfig.type === 'local') {
      return await this.savePhotoLocally(file, organizationId)
    } else {
      return await this.savePhotoOnline(file, organizationId)
    }
  }

  private async savePhotoLocally(file: File, organizationId: string): Promise<string> {
    if (!this.storageConfig?.localPath) {
      throw new Error('Local storage path not configured')
    }

    const fileExtension = extensionByMimeType[file.type]
    if (!fileExtension) {
      throw new Error('Unsupported file type')
    }

    const fileName = `${uuidv4()}.${fileExtension}`
    const orgDirectory = path.resolve(this.storageConfig.localPath, organizationId)
    const filePath = path.resolve(orgDirectory, fileName)

    if (!filePath.startsWith(`${orgDirectory}${path.sep}`)) {
      throw new Error('Invalid upload path')
    }

    // Ensure organization directory exists
    await this.ensureDirectoryExists(orgDirectory)

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Save file
    await fs.writeFile(filePath, buffer)

    // Return relative path from public directory
    return `/uploads/${organizationId}/${fileName}`
  }

  private async savePhotoOnline(file: File, organizationId: string): Promise<string> {
    // This would integrate with your existing uploadthing logic
    // For now, we'll throw an error to indicate online storage needs implementation
    throw new Error('Online storage integration needed - use existing uploadthing')
  }

  private async ensureDirectoryExists(dirPath: string) {
    try {
      await fs.access(dirPath)
    } catch {
      await fs.mkdir(dirPath, { recursive: true })
    }
  }

  async deletePhoto(photoPath: string): Promise<boolean> {
    if (!this.storageConfig) {
      throw new Error('Storage configuration not set')
    }

    if (this.storageConfig.type === 'local') {
      return await this.deletePhotoLocally(photoPath)
    } else {
      return await this.deletePhotoOnline(photoPath)
    }
  }

  private async deletePhotoLocally(photoPath: string): Promise<boolean> {
    try {
      if (!this.storageConfig?.localPath) {
        throw new Error('Local storage path not configured')
      }

      // Convert web path to file system path
      const relativePath = photoPath.replace(/^\/uploads\//, '')
      const parts = relativePath.split('/')
      const [organizationId, fileName] = parts

      if (parts.length !== 2 || !organizationId || !fileName || fileName.includes('..') || !/^[a-zA-Z0-9._-]+$/.test(fileName)) {
        return false
      }

      const orgDirectory = path.resolve(this.storageConfig.localPath, organizationId)
      const fullPath = path.resolve(orgDirectory, fileName)

      if (!fullPath.startsWith(`${orgDirectory}${path.sep}`)) {
        return false
      }

      await fs.unlink(fullPath)
      return true
    } catch (error) {
      console.error('Error deleting local photo:', error)
      return false
    }
  }

  private async deletePhotoOnline(photoPath: string): Promise<boolean> {
    // Implementation for online photo deletion
    console.log('Online photo deletion not implemented yet for:', photoPath)
    return false
  }

  getStorageType(): StorageType | null {
    return this.storageConfig?.type || null
  }
}

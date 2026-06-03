"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Loader2,
  HardDrive,
  Cloud,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Info,
  Shield,
  Zap,
  Database,
  FolderOpen,
  Upload
} from "lucide-react"
import {
  useStorageConfiguration,
  useUpdateStorageConfiguration,
  useInitializeStorageConfiguration
} from '@/hooks/useStorageConfiguration'
import { StorageType } from '@/types/storage'

interface PhotoStorageConfigurationProps {
  organizationId: string
}

export default function PhotoStorageConfiguration({ organizationId }: PhotoStorageConfigurationProps) {
  const [storageType, setStorageType] = useState<'local' | 'online'>('local')
  const [localPath, setLocalPath] = useState('/public/uploads')
  const [maxFileSize, setMaxFileSize] = useState('1')
  const [allowedTypes, setAllowedTypes] = useState('image/jpeg,image/png,image/gif')


  // TanStack Query hooks
  const {
    data: configuration,
    isLoading,
    error,
    isError
  } = useStorageConfiguration(organizationId)

  const updateMutation = useUpdateStorageConfiguration()
  const initializeMutation = useInitializeStorageConfiguration()

  // Sync form state with fetched data
  useEffect(() => {
    if (configuration) {
      setStorageType(configuration.storageType as StorageType)
      setLocalPath(configuration.localStoragePath)
      setMaxFileSize((configuration.maxFileSize / (1024 * 1024)).toString())
      setAllowedTypes(configuration.allowedFileTypes.join(','))
    }
  }, [configuration])

  // Auto-initialize storage configuration if none exists
  useEffect(() => {
    if (!isLoading && !configuration && !isError && organizationId) {
      console.log('No configuration found, initializing...')
      initializeMutation.mutate(organizationId)
    }
  }, [isLoading, configuration, isError, organizationId]) // Remove initializeMutation from dependencies

  const handleSave = async () => {
    // Validation
    if (!localPath.trim() && storageType === 'local') {
      return
    }

    const maxSizeBytes = parseFloat(maxFileSize) * 1024 * 1024
    if (isNaN(maxSizeBytes) || maxSizeBytes <= 0) {
      return
    }

    const allowedTypesArray = allowedTypes
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0)

    updateMutation.mutate({
      organizationId,
      storageType,
      localStoragePath: localPath.trim(),
      maxFileSize: maxSizeBytes,
      allowedFileTypes: allowedTypesArray
    })
  }

  const handleInitialize = () => {
    initializeMutation.mutate(organizationId)
  }

  const handleSelectFolder = async () => {
    try {
      // Use the File System Access API if available (modern browsers)
      if ('showDirectoryPicker' in window) {
        const directoryHandle = await (window as any).showDirectoryPicker()
        setLocalPath(directoryHandle.name)
      } else {
        // Fallback: Create a hidden file input for folder selection
        const input = document.createElement('input')
        input.type = 'file'
        input.webkitdirectory = true
        input.style.display = 'none'

        input.onchange = (event) => {
          const files = (event.target as HTMLInputElement).files
          if (files && files.length > 0) {
            // Extract the common directory path
            const firstFile = files[0]
            const pathParts = firstFile.webkitRelativePath.split('/')
            const folderName = pathParts[0]
            setLocalPath(`/public/uploads/${folderName}`)
          }
        }

        document.body.appendChild(input)
        input.click()
        document.body.removeChild(input)
      }
    } catch (error) {
      console.error('Error selecting folder:', error)
      // User cancelled or error occurred
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <Badge variant="outline" className="animate-pulse">
            <Database className="h-3 w-3 mr-1" />
            Loading...
          </Badge>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              <div className="text-center space-y-1">
                <p className="font-medium">Loading Storage Configuration</p>
                <p className="text-sm text-muted-foreground">Fetching your organization's storage settings...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Photo Storage Configuration</h1>
            <p className="text-muted-foreground">Enterprise-grade photo storage management</p>
          </div>
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Error
          </Badge>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load storage configuration. {error?.message}
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Configuration Error</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                We encountered an error loading your storage configuration. Please try initializing the system or contact support.
              </p>
            </div>
            <Button
              onClick={handleInitialize}
              disabled={initializeMutation.isPending}
              variant="outline"
              className="min-w-32"
            >
              {initializeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Initializing...
                </>
              ) : (
                'Initialize Storage'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Photo Storage Configuration</h1>
          <p className="text-muted-foreground">Enterprise-grade photo storage management for your organization</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={configuration ? "default" : "secondary"}>
            {configuration ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configured
              </>
            ) : (
              <>
                <Settings2 className="h-3 w-3 mr-1" />
                Setup Required
              </>
            )}
          </Badge>
          {configuration && (
            <Badge variant="outline">
              {configuration.storageType === 'local' ? (
                <>
                  <HardDrive className="h-3 w-3 mr-1" />
                  Local
                </>
              ) : (
                <>
                  <Cloud className="h-3 w-3 mr-1" />
                  Cloud
                </>
              )}
            </Badge>
          )}
        </div>
      </div>

      {/* Status Alert */}
      {!configuration && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No storage configuration found for your organization. Please set up your photo storage preferences below.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Configuration Card */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings2 className="h-5 w-5 text-emerald-600" />
                Storage Configuration
              </CardTitle>
              <CardDescription>
                Configure how photos and images are stored in your system. Choose between local file storage or cloud-based storage.
              </CardDescription>
            </div>
            {configuration && (
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">Current Usage</p>
                <p className="text-xs text-muted-foreground">Max {(configuration.maxFileSize / (1024 * 1024)).toFixed(1)}MB per file</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Storage Type Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Storage Infrastructure</Label>
              <Badge variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Enterprise Grade
              </Badge>
            </div>
            <RadioGroup
              value={storageType}
              onValueChange={(value) => setStorageType(value as 'local' | 'online')}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Local Storage Option */}
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${storageType === 'local' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-emerald-200/50 hover:border-emerald-300/70'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="local" id="local" className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-emerald-600" />
                        <Label htmlFor="local" className="text-lg font-semibold cursor-pointer">
                          Local Storage
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Performance
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Store files on your server's file system with complete control over data sovereignty and access patterns.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Complete data control
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          No external dependencies
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Cost-effective for high volume
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cloud Storage Option */}
              <Card className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${storageType === 'online' ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-emerald-200/50 hover:border-emerald-300/70'}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="online" id="online" className="mt-1" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-emerald-600" />
                        <Label htmlFor="online" className="text-lg font-semibold cursor-pointer">
                          Cloud Storage
                        </Label>
                        <Badge variant="secondary" className="text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          Managed
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Leverage UploadThing's cloud infrastructure for scalable, reliable storage with global CDN distribution.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Global CDN acceleration
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Automatic backups & redundancy
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          Zero maintenance required
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </RadioGroup>
          </div>

          <Separator />

          {/* Storage-Specific Configuration */}
          {storageType === 'local' && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <HardDrive className="h-5 w-5" />
                  Local Storage Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label htmlFor="localPath" className="text-sm font-medium">Storage Directory Path</Label>
                  <div className="flex gap-2">
                    <Input
                      id="localPath"
                      value={localPath}
                      onChange={(e) => setLocalPath(e.target.value)}
                      placeholder="/public/uploads"
                      className="flex-1 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectFolder}
                      className="px-3 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
                      title="Select folder"
                    >
                      <FolderOpen className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-700 bg-emerald-100 p-2 rounded-sm">
                      <Info className="h-3 w-3 inline mr-1" />
                      Ensure this directory has proper write permissions and is accessible via web requests.
                    </p>
                    <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-sm border border-emerald-200">
                      <Upload className="h-3 w-3 inline mr-1" />
                      Click the folder icon to browse and select a local directory for image storage.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {storageType === 'online' && (
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-emerald-900">
                  <Cloud className="h-5 w-5" />
                  Cloud Storage Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-emerald-900">
                      Fully Managed Service
                    </p>
                    <p className="text-xs text-emerald-700">
                      Photos will be automatically stored using UploadThing's enterprise cloud infrastructure.
                      No additional configuration required - the service handles security, scaling, and global distribution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* File Upload Settings */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold">File Upload Policies</h4>
                <p className="text-sm text-muted-foreground">Configure upload restrictions and file type policies</p>
              </div>
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                Security
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="maxFileSize" className="text-sm font-medium">Maximum File Size (MB)</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={maxFileSize}
                  onChange={(e) => setMaxFileSize(e.target.value)}
                  placeholder="1"
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 1-5MB for optimal performance
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="allowedTypes" className="text-sm font-medium">Allowed MIME Types</Label>
                <Input
                  id="allowedTypes"
                  value={allowedTypes}
                  onChange={(e) => setAllowedTypes(e.target.value)}
                  placeholder="image/jpeg,image/png,image/gif"
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated MIME types (e.g., image/jpeg, image/png)
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-muted-foreground">
              Changes take effect immediately for new uploads
            </div>
            <div className="flex items-center gap-3">
              {!configuration && (
                <Button
                  onClick={handleInitialize}
                  disabled={initializeMutation.isPending}
                  variant="outline"
                  size="sm"
                >
                  {initializeMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Initializing...
                    </>
                  ) : (
                    'Initialize Default'
                  )}
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="min-w-32 bg-emerald-600 hover:bg-emerald-700"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
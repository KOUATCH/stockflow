"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineTitle,
  TimelineIcon,
  TimelineDescription,
  TimelineContent,
} from "@/components/ui/timeline"
import {
  MapPin,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Camera,
  FileText,
  Navigation,
  Phone,
  User,
  Calendar,
  Route,
  Loader2,
  RefreshCw,
  Edit,
  Upload
} from 'lucide-react'
import { format } from 'date-fns'
import {
  DeliveryStatus,
  DeliveryPriority,
  ExtendedOrderDelivery,
  DeliveryTrackingUpdate,
  UpdateDeliveryFormData,
  DELIVERY_STATUS_COLORS,
  getDeliveryStatusLabel,
  getNextDeliveryStatus,
  canEditDelivery
} from '@/types/delivery'
import { getDeliveryTracking, updateDeliveryStatus } from '@/actions/delivery/deliverySystemActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface DeliveryTrackingSystemProps {
  delivery: ExtendedOrderDelivery
  organizationId: string
  currentUserId: string
  onDeliveryUpdate?: (delivery: ExtendedOrderDelivery) => void
}

export function DeliveryTrackingSystem({
  delivery,
  organizationId,
  currentUserId,
  onDeliveryUpdate
}: DeliveryTrackingSystemProps) {
  const notifications = useNotifications()

  // State management
  const [trackingData, setTrackingData] = useState<DeliveryTrackingUpdate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [showProofOfDelivery, setShowProofOfDelivery] = useState(false)

  // Status update form
  const [newStatus, setNewStatus] = useState<DeliveryStatus>(delivery.status as DeliveryStatus)
  const [updateNotes, setUpdateNotes] = useState('')
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [failureReason, setFailureReason] = useState('')
  const [proofImages, setProofImages] = useState<File[]>([])
  const [recipientName, setRecipientName] = useState('')
  const [recipientSignature, setRecipientSignature] = useState('')
  const [proofNotes, setProofNotes] = useState('')

  // Load tracking data
  useEffect(() => {
    const loadTrackingData = async () => {
      try {
        setIsLoading(true)
        const result = await getDeliveryTracking(delivery.id, organizationId)

        if (result.success && result.data) {
          setTrackingData(result.data)
        }
      } catch (error) {
        console.error('Error loading tracking data:', error)
        notifications.error('Loading Error', 'Failed to load tracking data')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrackingData()
  }, [delivery.id, organizationId])

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
          notifications.success('Location Updated', 'Current location has been captured')
        },
        (error) => {
          console.error('Error getting location:', error)
          notifications.warning('Location Error', 'Could not get current location')
        }
      )
    } else {
      notifications.warning('Location Not Supported', 'Geolocation is not supported by this browser')
    }
  }

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!newStatus) {
      notifications.formError('Status Update', 'Please select a status', 'A valid status is required')
      return
    }

    try {
      setIsUpdating(true)

      const updateData: UpdateDeliveryFormData = {
        status: newStatus,
        deliveryNotes: updateNotes || undefined,
        location: currentLocation || undefined,
        failureReason: newStatus === DeliveryStatus.FAILED_DELIVERY ? failureReason : undefined,
        actualDeliveryDate: newStatus === DeliveryStatus.DELIVERED ? new Date() : undefined
      }

      // Add proof of delivery if delivered
      if (newStatus === DeliveryStatus.DELIVERED && (recipientName || recipientSignature || proofNotes)) {
        updateData.proofOfDelivery = {
          recipientName: recipientName || delivery.recipientName || '',
          recipientSignature,
          notes: proofNotes,
          photos: proofImages
        }
      }

      const result = await updateDeliveryStatus(
        delivery.id,
        updateData,
        organizationId,
        currentUserId
      )

      if (result.success) {
        notifications.success(
          'Status Updated',
          `Delivery status updated to ${getDeliveryStatusLabel(newStatus)}`
        )

        // Refresh tracking data
        const trackingResult = await getDeliveryTracking(delivery.id, organizationId)
        if (trackingResult.success && trackingResult.data) {
          setTrackingData(trackingResult.data)
        }

        // Reset form
        setUpdateNotes('')
        setFailureReason('')
        setCurrentLocation(null)
        setRecipientName('')
        setRecipientSignature('')
        setProofNotes('')
        setProofImages([])
        setShowStatusUpdate(false)

        // Notify parent component
        if (onDeliveryUpdate) {
          onDeliveryUpdate({ ...delivery, status: newStatus })
        }
      } else {
        notifications.error('Update Failed', result.error || 'Failed to update delivery status')
      }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      notifications.error('Update Error', 'An unexpected error occurred')
    } finally {
      setIsUpdating(false)
    }
  }

  // Get status icon
  const getStatusIcon = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.SCHEDULED:
        return <Calendar className="w-4 h-4" />
      case DeliveryStatus.IN_TRANSIT:
        return <Truck className="w-4 h-4" />
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return <Navigation className="w-4 h-4" />
      case DeliveryStatus.DELIVERED:
        return <CheckCircle className="w-4 h-4" />
      case DeliveryStatus.FAILED_DELIVERY:
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  // Get progress percentage
  const getProgressPercentage = (status: DeliveryStatus): number => {
    switch (status) {
      case DeliveryStatus.DRAFT:
        return 0
      case DeliveryStatus.SCHEDULED:
        return 20
      case DeliveryStatus.IN_TRANSIT:
        return 50
      case DeliveryStatus.OUT_FOR_DELIVERY:
        return 80
      case DeliveryStatus.DELIVERED:
        return 100
      case DeliveryStatus.FAILED_DELIVERY:
      case DeliveryStatus.CANCELLED:
        return 0
      default:
        return 0
    }
  }

  const currentProgress = getProgressPercentage(delivery.status as DeliveryStatus)
  const nextStatuses = getNextDeliveryStatus(delivery.status as DeliveryStatus)

  return (
    <div className="space-y-6">
      {/* Delivery Overview */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Delivery {delivery.deliveryNumber}
              </CardTitle>
              <CardDescription>
                Order: {delivery.order.orderNumber} • Customer: {delivery.order.customer.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge className={DELIVERY_STATUS_COLORS[delivery.status as DeliveryStatus]}>
                {getDeliveryStatusLabel(delivery.status as DeliveryStatus)}
              </Badge>
              {canEditDelivery(delivery.status as DeliveryStatus) && (
                <Button variant="outline" size="sm" onClick={() => setShowStatusUpdate(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Delivery Progress</span>
              <span className="text-sm text-muted-foreground">{currentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${currentProgress}%` }}
              />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium">{delivery.deliveryAddress}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Recipient:</span>
                  <p className="font-medium">{delivery.recipientName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{delivery.recipientPhone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Scheduled:</span>
                  <p className="font-medium">{format(new Date(delivery.deliveryDate), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Items to Deliver
              </h4>
              <div className="space-y-2">
                {delivery.deliveryItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <div>
                      <p className="font-medium text-sm">{item.orderLine.item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.orderLine.item.sku}</p>
                    </div>
                    <Badge variant="outline">
                      {item.quantityDelivered}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Additional Information
              </h4>
              <div className="space-y-2 text-sm">
                {delivery.deliveryNotes && (
                  <div>
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="font-medium">{delivery.deliveryNotes}</p>
                  </div>
                )}
                {delivery.specialInstructions && (
                  <div>
                    <span className="text-muted-foreground">Special Instructions:</span>
                    <p className="font-medium">{delivery.specialInstructions}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Priority:</span>
                  <Badge variant="outline" className="ml-2">
                    {delivery.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tracking Timeline */}
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Delivery Timeline
            </CardTitle>
            <CardDescription>
              Real-time tracking updates and delivery history
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const loadTrackingData = async () => {
                const result = await getDeliveryTracking(delivery.id, organizationId)
                if (result.success && result.data) {
                  setTrackingData(result.data)
                }
              }
              loadTrackingData()
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading tracking data...</span>
            </div>
          ) : trackingData.length > 0 ? (
            <Timeline>
              {trackingData.map((update, index) => (
                <TimelineItem key={update.id}>
                  <TimelineHeader>
                    <TimelineIcon className={DELIVERY_STATUS_COLORS[update.status]}>
                      {getStatusIcon(update.status)}
                    </TimelineIcon>
                    <TimelineTitle>{getDeliveryStatusLabel(update.status)}</TimelineTitle>
                  </TimelineHeader>
                  <TimelineContent>
                    <div className="space-y-2">
                      <TimelineDescription>
                        {format(new Date(update.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </TimelineDescription>
                      {update.notes && (
                        <p className="text-sm">{update.notes}</p>
                      )}
                      {update.location && (
                        <div className="text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {update.location.address}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Updated by: {update.updatedByUser?.name || 'System'}
                        {update.isSystemGenerated && ' (Automated)'}
                      </div>
                    </div>
                  </TimelineContent>
                  {index < trackingData.length - 1 && <TimelineConnector />}
                </TimelineItem>
              ))}
            </Timeline>
          ) : (
            <div className="text-center py-8">
              <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Tracking Data</h3>
              <p className="text-muted-foreground">
                No tracking updates available for this delivery yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={showStatusUpdate} onOpenChange={setShowStatusUpdate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Delivery Status</DialogTitle>
            <DialogDescription>
              Update the delivery status and add tracking information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as DeliveryStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {nextStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getDeliveryStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Update Notes</Label>
              <Textarea
                id="notes"
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
                placeholder="Add notes about this status update..."
                rows={3}
              />
            </div>

            {newStatus === DeliveryStatus.FAILED_DELIVERY && (
              <div>
                <Label htmlFor="failure-reason">Failure Reason</Label>
                <Textarea
                  id="failure-reason"
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  placeholder="Describe why the delivery failed..."
                  rows={2}
                />
              </div>
            )}

            {newStatus === DeliveryStatus.DELIVERED && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input
                    id="recipient"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Name of person who received delivery"
                  />
                </div>
                <div>
                  <Label htmlFor="proof-notes">Delivery Notes</Label>
                  <Textarea
                    id="proof-notes"
                    value={proofNotes}
                    onChange={(e) => setProofNotes(e.target.value)}
                    placeholder="Any notes about the delivery..."
                    rows={2}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isUpdating}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Get Location
              </Button>
              {currentLocation && (
                <Badge variant="outline">
                  Location captured
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStatusUpdate(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={isUpdating || !newStatus}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Update Status
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
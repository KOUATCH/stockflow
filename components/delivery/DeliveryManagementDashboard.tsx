"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MapPin,
  Package,
  Truck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Route,
  Phone,
  User,
  FileText,
  Camera,
  Navigation,
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Eye,
  RotateCcw,
  X,
  Loader2
} from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { format } from 'date-fns'
import {
  DeliveryStatus,
  DeliveryPriority,
  ExtendedOrderDelivery,
  DeliveryDashboardData,
  DeliveryFilters,
  DELIVERY_STATUS_COLORS,
  DELIVERY_PRIORITY_COLORS,
  getDeliveryStatusLabel,
  getPriorityLabel,
  canEditDelivery,
  canCancelDelivery,
  canRescheduleDelivery
} from '@/types/delivery'
import { getDeliveryDashboard, getDeliveries, updateDeliveryStatus, rescheduleDelivery } from '@/actions/delivery/deliverySystemActions'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface DeliveryManagementDashboardProps {
  organizationId: string
  currentUserId: string
}

export function DeliveryManagementDashboard({ organizationId, currentUserId }: DeliveryManagementDashboardProps) {
  const notifications = useNotifications()

  // State management
  const [dashboardData, setDashboardData] = useState<DeliveryDashboardData | null>(null)
  const [deliveries, setDeliveries] = useState<ExtendedOrderDelivery[]>([])
  const [filteredDeliveries, setFilteredDeliveries] = useState<ExtendedOrderDelivery[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<ExtendedOrderDelivery | null>(null)

  // Dialog states
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false)
  const [showTrackingDialog, setShowTrackingDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showStatusUpdateDialog, setShowStatusUpdateDialog] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<DeliveryFilters>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<DeliveryPriority | 'ALL'>('ALL')
  const [dateFromFilter, setDateFromFilter] = useState<Date | undefined>()
  const [dateToFilter, setDateToFilter] = useState<Date | undefined>()

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        const [dashboardResult, deliveriesResult] = await Promise.all([
          getDeliveryDashboard(organizationId),
          getDeliveries(organizationId, filters)
        ])

        if (dashboardResult.success && dashboardResult.data) {
          setDashboardData(dashboardResult.data)
        }

        if (deliveriesResult.success && deliveriesResult.data) {
          setDeliveries(deliveriesResult.data)
          setFilteredDeliveries(deliveriesResult.data)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        notifications.error('Data Loading Error', 'Failed to load delivery data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [organizationId, filters])

  // Apply filters
  useEffect(() => {
    let filtered = [...deliveries]

    if (searchTerm) {
      filtered = filtered.filter(delivery =>
        delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter)
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(delivery => delivery.priority === priorityFilter)
    }

    if (dateFromFilter) {
      filtered = filtered.filter(delivery => new Date(delivery.deliveryDate) >= dateFromFilter)
    }

    if (dateToFilter) {
      filtered = filtered.filter(delivery => new Date(delivery.deliveryDate) <= dateToFilter)
    }

    setFilteredDeliveries(filtered)
  }, [deliveries, searchTerm, statusFilter, priorityFilter, dateFromFilter, dateToFilter])

  const handleStatusUpdate = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      const result = await updateDeliveryStatus(
        deliveryId,
        { status: newStatus },
        organizationId,
        currentUserId
      )

      if (result.success) {
        notifications.success('Status Updated', `Delivery status updated to ${getDeliveryStatusLabel(newStatus)}`)
        // Refresh data
        const deliveriesResult = await getDeliveries(organizationId, filters)
        if (deliveriesResult.success && deliveriesResult.data) {
          setDeliveries(deliveriesResult.data)
        }
      } else {
        notifications.error('Update Failed', result.error || 'Failed to update delivery status')
      }
    } catch (error) {
      console.error('Error updating delivery status:', error)
      notifications.error('Update Error', 'An unexpected error occurred')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading delivery data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            Delivery Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive delivery tracking and management system
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowDeliveryDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Delivery
          </Button>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Today's Deliveries</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{dashboardData.todaysDeliveries.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="mt-4 text-xs text-blue-700 dark:text-blue-300">
                {dashboardData.todaysDeliveries.completed} completed, {dashboardData.todaysDeliveries.pending} pending
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {dashboardData.deliveryMetrics.onTimeRate.toFixed(1)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="mt-4 text-xs text-green-700 dark:text-green-300">
                Last 30 days performance
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400">In Transit</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{dashboardData.todaysDeliveries.inTransit}</p>
                </div>
                <Truck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="mt-4 text-xs text-orange-700 dark:text-orange-300">
                Currently out for delivery
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed Deliveries</p>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">{dashboardData.todaysDeliveries.failed}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="mt-4 text-xs text-red-700 dark:text-red-300">
                Require attention
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="deliveries">All Deliveries</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="routes">Route Planning</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="space-y-4">
          {/* Filters */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search deliveries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DeliveryStatus | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      {Object.values(DeliveryStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {getDeliveryStatusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Priority</Label>
                  <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as DeliveryPriority | 'ALL')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Priorities</SelectItem>
                      {Object.values(DeliveryPriority).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {getPriorityLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>From Date</Label>
                  <DatePicker
                    date={dateFromFilter}
                    onDateChange={setDateFromFilter}
                    placeholder="Select from date"
                  />
                </div>

                <div>
                  <Label>To Date</Label>
                  <DatePicker
                    date={dateToFilter}
                    onDateChange={setDateToFilter}
                    placeholder="Select to date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deliveries Table */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Delivery #</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">{delivery.deliveryNumber}</TableCell>
                        <TableCell className="font-medium">{delivery.order.orderNumber}</TableCell>
                        <TableCell>{delivery.order.customer.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{delivery.deliveryAddress}</TableCell>
                        <TableCell>
                          <Badge className={DELIVERY_STATUS_COLORS[delivery.status as DeliveryStatus]}>
                            {getDeliveryStatusLabel(delivery.status as DeliveryStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={DELIVERY_PRIORITY_COLORS[delivery.priority as DeliveryPriority]}>
                            {getPriorityLabel(delivery.priority as DeliveryPriority)}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(delivery.deliveryDate), 'MMM dd, HH:mm')}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedDelivery(delivery)
                                setShowDeliveryDialog(true)
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {canEditDelivery(delivery.status as DeliveryStatus) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedDelivery(delivery)
                                  setShowStatusUpdateDialog(true)
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            {canRescheduleDelivery(delivery.status as DeliveryStatus) && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedDelivery(delivery)
                                  setShowRescheduleDialog(true)
                                }}
                              >
                                <RotateCcw className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="w-5 h-5" />
                Live Delivery Tracking
              </CardTitle>
              <CardDescription>
                Real-time tracking of active deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Live Tracking Map</h3>
                <p className="text-muted-foreground mb-6">
                  Interactive map showing real-time delivery locations and routes
                </p>
                <p className="text-sm text-muted-foreground">
                  Map integration coming soon...
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5" />
                Route Planning & Optimization
              </CardTitle>
              <CardDescription>
                Plan and optimize delivery routes for maximum efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Route Optimization</h3>
                <p className="text-muted-foreground mb-6">
                  Automatic route planning with traffic optimization and delivery scheduling
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Delivery Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive delivery performance metrics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground mb-6">
                  Detailed analytics on delivery performance, driver efficiency, and customer satisfaction
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-6 text-center">
                      <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <h4 className="font-semibold">Delivery Times</h4>
                      <p className="text-sm text-muted-foreground">Average delivery time analysis</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-6 text-center">
                      <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <h4 className="font-semibold">Coverage Heatmap</h4>
                      <p className="text-sm text-muted-foreground">Delivery density and coverage areas</p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-6 text-center">
                      <User className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <h4 className="font-semibold">Driver Performance</h4>
                      <p className="text-sm text-muted-foreground">Driver efficiency and ratings</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {/* Create/View Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedDelivery ? `Delivery ${selectedDelivery.deliveryNumber}` : 'Create New Delivery'}
            </DialogTitle>
            <DialogDescription>
              {selectedDelivery ? 'View delivery details and tracking information' : 'Create a new delivery for an order'}
            </DialogDescription>
          </DialogHeader>
          {/* Delivery form content would go here */}
          <div className="space-y-4">
            <p className="text-muted-foreground">Delivery form content coming soon...</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
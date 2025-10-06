"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransfers } from "@/hooks/useTransferQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { formatCurrency } from "@/lib/utils"
import type { TransferStatus, TransferPriority } from "@/types/inventoryMovementTypes"
import { ArrowRight, Clock, Package, Plus, Search, Truck, CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, User } from 'lucide-react'
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState } from "react"
import { format } from "date-fns"
import { CreateTransferModal } from "./CreateTransferModal"
import { TransferDetailsModal } from "./TransferDetailsModal"

const transferStatusConfig = {
  DRAFT: {
    icon: <Clock className="h-3 w-3" />,
    color: "bg-gray-100 text-gray-800",
    label: "Draft",
    description: "Being prepared",
  },
  SUBMITTED: {
    icon: <Clock className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-800",
    label: "Submitted",
    description: "Awaiting approval",
  },
  APPROVED: {
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800",
    label: "Approved",
    description: "Ready to ship",
  },
  IN_TRANSIT: {
    icon: <Truck className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-800",
    label: "In Transit",
    description: "Being transferred",
  },
  PARTIALLY_RECEIVED: {
    icon: <Package className="h-3 w-3" />,
    color: "bg-yellow-100 text-yellow-800",
    label: "Partial",
    description: "Partially received",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-3 w-3" />,
    color: "bg-green-100 text-green-800",
    label: "Completed",
    description: "Transfer complete",
  },
  CANCELLED: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Cancelled",
    description: "Transfer cancelled",
  },
  REJECTED: {
    icon: <XCircle className="h-3 w-3" />,
    color: "bg-red-100 text-red-800",
    label: "Rejected",
    description: "Transfer rejected",
  },
}

const priorityConfig = {
  LOW: {
    color: "bg-gray-100 text-gray-800",
    label: "Low",
  },
  NORMAL: {
    color: "bg-blue-100 text-blue-800",
    label: "Normal",
  },
  HIGH: {
    color: "bg-orange-100 text-orange-800",
    label: "High",
  },
  URGENT: {
    color: "bg-red-100 text-red-800",
    label: "Urgent",
  },
}

export function TransferDashboard() {
  const { data: session } = useSession()
  const orgId = user || ""

  const [selectedStatus, setSelectedStatus] = useState<TransferStatus | "all">("all")
  const [selectedFromLocation, setSelectedFromLocation] = useState<string>("all")
  const [selectedToLocation, setSelectedToLocation] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null)

  // Fetch data
  const { data: transfersResponse, isLoading } = useTransfers(orgId, {
    search: searchQuery || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    fromLocationId: selectedFromLocation === "all" ? undefined : selectedFromLocation,
    toLocationId: selectedToLocation === "all" ? undefined : selectedToLocation,
    page: 1,
    limit: 50,
  })

  const { data: locationsResponse } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const transfers = transfersResponse?.data || []
  const locations = locationsResponse?.data || []

  // Calculate summary stats
  const summaryStats = {
    total: transfers.length,
    draft: transfers.filter(t => t.status === "DRAFT").length,
    inTransit: transfers.filter(t => t.status === "IN_TRANSIT").length,
    completed: transfers.filter(t => t.status === "COMPLETED").length,
  }

  if (isLoading) {
    return <TransferDashboardSkeleton />
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location Transfers</h1>
          <p className="text-muted-foreground mt-1">Manage inventory transfers between locations</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Transfer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{summaryStats.total}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gray-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{summaryStats.draft}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{summaryStats.inTransit}</div>
            <p className="text-xs text-muted-foreground">Being transferred</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summaryStats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transfers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
          <TabsTrigger value="analytics">Transfer Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transfers" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Location Transfers
              </CardTitle>
              <CardDescription>View and manage all location-to-location transfers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search transfers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as TransferStatus | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.entries(transferStatusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFromLocation} onValueChange={setSelectedFromLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="From Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedToLocation} onValueChange={setSelectedToLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="To Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedStatus("all")
                    setSelectedFromLocation("all")
                    setSelectedToLocation("all")
                  }}
                >
                  Clear Filters
                </Button>
              </div>

              {/* Transfers Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transfer #</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-lg font-medium">No transfers found</p>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery || selectedStatus !== "all" || selectedFromLocation !== "all" || selectedToLocation !== "all"
                              ? "Try adjusting your filters"
                              : "Create your first transfer to get started"}
                          </p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      transfers.map((transfer) => {
                        const statusConfig = transferStatusConfig[transfer.status]
                        const priorityConfigItem = priorityConfig[transfer.priority]

                        return (
                          <TableRow 
                            key={transfer.id} 
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => setSelectedTransfer(transfer.id)}
                          >
                            <TableCell>
                              <div className="font-medium">{transfer.transferNumber}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{transfer.fromLocation.name}</span>
                                </div>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{transfer.toLocation.name}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`gap-1.5 ${statusConfig.color}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={priorityConfigItem.color}>
                                {priorityConfigItem.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{transfer.lines.length} items</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{transfer.createdBy?.name || "Unknown"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm">{format(new Date(transfer.createdAt), "MMM dd, yyyy")}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedTransfer(transfer.id)
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Transfer Trends
                </CardTitle>
                <CardDescription>Track transfer patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Analytics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed transfer analytics and reporting features will be available here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Route Performance
                </CardTitle>
                <CardDescription>Monitor transfer route efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium mt-4">Route Analytics Coming Soon</p>
                  <p className="text-sm text-muted-foreground">
                    Route performance metrics and optimization suggestions will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateTransferModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        organizationId={orgId}
      />
      
      {selectedTransfer && (
        <TransferDetailsModal
          transferId={selectedTransfer}
          open={!!selectedTransfer}
          onOpenChange={(open) => !open && setSelectedTransfer(null)}
          organizationId={orgId}
        />
      )}
    </div>
  )
}

const TransferDashboardSkeleton = () => (
  <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  </div>
)

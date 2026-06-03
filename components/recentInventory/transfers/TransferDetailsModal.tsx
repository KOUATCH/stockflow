"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransfer, useApproveTransfer } from "@/hooks/useTransferQueries"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, Calendar, CheckCircle, Clock, MapPin, Package, Truck, User, XCircle, AlertTriangle, FileText, Activity } from 'lucide-react'
import { useAuth } from "@/hooks/useAuth"
import { format } from "date-fns"

interface TransferDetailsModalProps {
  transferId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
}

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
  LOW: { color: "bg-gray-100 text-gray-800", label: "Low" },
  NORMAL: { color: "bg-blue-100 text-blue-800", label: "Normal" },
  HIGH: { color: "bg-orange-100 text-orange-800", label: "High" },
  URGENT: { color: "bg-red-100 text-red-800", label: "Urgent" },
}

export function TransferDetailsModal({ transferId, open, onOpenChange, organizationId }: TransferDetailsModalProps) {
  const { user: session } = useAuth()
  const userId = session?.id || ""

  const { data: transfer, isLoading } = useTransfer(transferId, organizationId)
  const approveTransferMutation = useApproveTransfer()

  if (isLoading || !transfer) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const statusConfig = transferStatusConfig[transfer.status]
  const priorityConfigItem = priorityConfig[transfer.priority]
  const canApprove = transfer.status === "DRAFT" && userId !== transfer.createdById

  const handleApprove = async () => {
    try {
      await approveTransferMutation.mutateAsync({
        transferId: transfer.id,
        organizationId,
        approvedById: userId,
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const totalItems = transfer.lines.reduce((sum, line) => sum + line.requestedQuantity, 0)
  const totalValue = transfer.lines.reduce((sum, line) => sum + (line.requestedQuantity * (line.item.costPrice || 0)), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Transfer Details - {transfer.transferNumber}
          </DialogTitle>
          <DialogDescription>
            View and manage transfer details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge className={`gap-1.5 ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="outline" className={priorityConfigItem.color}>
                    {priorityConfigItem.label} Priority
                  </Badge>
                </div>
                {canApprove && (
                  <Button 
                    onClick={handleApprove}
                    disabled={approveTransferMutation.isPending}
                    className="gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {approveTransferMutation.isPending ? "Approving..." : "Approve Transfer"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Route Visualization */}
              <div className="flex items-center justify-center gap-6 p-6 bg-muted/50 rounded-lg mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-3">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="font-medium">{transfer.fromLocation.name}</div>
                  <div className="text-sm text-muted-foreground">Source Location</div>
                  {transfer.fromLocation.address && (
                    <div className="text-xs text-muted-foreground mt-1">{transfer.fromLocation.address}</div>
                  )}
                </div>
                
                <div className="flex flex-col items-center gap-2">
                  <ArrowRight className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">
                    {totalItems} items
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="font-medium">{transfer.toLocation.name}</div>
                  <div className="text-sm text-muted-foreground">Destination Location</div>
                  {transfer.toLocation.address && (
                    <div className="text-xs text-muted-foreground mt-1">{transfer.toLocation.address}</div>
                  )}
                </div>
              </div>

              {/* Transfer Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Package className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
                  <div className="text-sm text-muted-foreground">Estimated Value</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto text-green-500 mb-2" />
                  <div className="text-sm font-medium">
                    {format(new Date(transfer.createdAt), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">Created Date</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="items" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="items">Items ({transfer.lines.length})</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="items" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Transfer Items
                  </CardTitle>
                  <CardDescription>Items included in this transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-center">Requested Qty</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total Value</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transfer.lines.map((line) => (
                          <TableRow key={line.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{line.item.name}</div>
                                <div className="text-sm text-muted-foreground">{line.item.sku}</div>
                                {line.item.description && (
                                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {line.item.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="font-medium">{line.requestedQuantity}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(line.item.costPrice || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">
                                {formatCurrency(line.requestedQuantity * (line.item.costPrice || 0))}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{line.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transfer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Transfer Number</Label>
                        <div className="font-medium">{transfer.transferNumber}</div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`gap-1.5 ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{statusConfig.description}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                        <div className="mt-1">
                          <Badge variant="outline" className={priorityConfigItem.color}>
                            {priorityConfigItem.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{transfer.createdBy?.name || "Unknown"}</span>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Created Date</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{format(new Date(transfer.createdAt), "PPP 'at' p")}</span>
                        </div>
                      </div>
                      
                      {transfer.approvedBy && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Approved By</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{transfer.approvedBy.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Transfer Timeline
                  </CardTitle>
                  <CardDescription>Track the progress of this transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">Transfer Created</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(transfer.createdAt), "PPP 'at' p")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Created by {transfer.createdBy?.name || "Unknown"}
                        </div>
                      </div>
                    </div>

                    {transfer.approvedDate && (
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Transfer Approved</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transfer.approvedDate), "PPP 'at' p")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Approved by {transfer.approvedBy?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    )}

                    {transfer.shippedDate && (
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Transfer Shipped</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transfer.shippedDate), "PPP 'at' p")}
                          </div>
                        </div>
                      </div>
                    )}

                    {transfer.receivedDate && (
                      <div className="flex items-start gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <Package className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Transfer Completed</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(transfer.receivedDate), "PPP 'at' p")}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {transfer.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Transfer Notes</CardTitle>
                      <CardDescription>Public notes visible to all users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="whitespace-pre-wrap">{transfer.notes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {transfer.internalNotes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Internal Notes
                        <Badge variant="secondary">Internal</Badge>
                      </CardTitle>
                      <CardDescription>Internal notes for authorized users only</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="whitespace-pre-wrap">{transfer.internalNotes}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!transfer.notes && !transfer.internalNotes && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No Notes</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          No additional notes have been added to this transfer.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}

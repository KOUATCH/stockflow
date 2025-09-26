"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { LocationTransferDTO } from "@/types/inventoryMovementTypes"
import { ArrowRight, CheckCircle, Clock, MapPin, Package, Truck, User, X } from "lucide-react"
import { format } from "date-fns"

const statusConfig = {
  DRAFT: {
    icon: <Clock className="h-4 w-4" />,
    color: "bg-gray-100 text-gray-800",
    label: "Draft",
    description: "Transfer is being prepared",
  },
  APPROVED: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-blue-100 text-blue-800",
    label: "Approved",
    description: "Transfer has been approved",
  },
  IN_TRANSIT: {
    icon: <Truck className="h-4 w-4" />,
    color: "bg-yellow-100 text-yellow-800",
    label: "In Transit",
    description: "Items are being moved",
  },
  COMPLETED: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-green-100 text-green-800",
    label: "Completed",
    description: "Transfer completed successfully",
  },
  CANCELLED: {
    icon: <X className="h-4 w-4" />,
    color: "bg-red-100 text-red-800",
    label: "Cancelled",
    description: "Transfer was cancelled",
  },
}

interface TransferDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transfer: LocationTransferDTO
}

export function TransferDetailsModal({ open, onOpenChange, transfer }: TransferDetailsModalProps) {
  const statusInfo = statusConfig[transfer.status as keyof typeof statusConfig]
  const totalItems = transfer.lines.reduce((sum, line) => sum + line.quantity, 0)
  const totalValue = transfer.lines.reduce((sum, line) => sum + line.quantity * (line.item.costPrice || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Transfer Details - {transfer.transferNumber}
          </DialogTitle>
          <DialogDescription>View complete details of this inventory transfer</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Transfer Status</h3>
                <div className="flex items-center gap-3">
                  <Badge className={`gap-2 ${statusInfo?.color || "bg-gray-100 text-gray-800"}`}>
                    {statusInfo?.icon}
                    {statusInfo?.label || transfer.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{statusInfo?.description}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Transfer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer #:</span>
                    <span className="font-medium">{transfer.transferNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(new Date(transfer.date), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{format(new Date(transfer.createdAt), "MMM dd, yyyy HH:mm")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Items:</span>
                    <span className="font-medium">{totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Value:</span>
                    <span className="font-medium">{formatCurrency(totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Transfer Route</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-3 mb-2">
                        <MapPin className="h-6 w-6 text-blue-600 mx-auto" />
                      </div>
                      <p className="font-medium text-blue-800">{transfer.fromLocation.name}</p>
                      <p className="text-xs text-blue-600">Source</p>
                      {transfer.fromLocation.address && (
                        <p className="text-xs text-muted-foreground mt-1">{transfer.fromLocation.address}</p>
                      )}
                    </div>
                    <ArrowRight className="h-8 w-8 text-blue-600" />
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-lg p-3 mb-2">
                        <MapPin className="h-6 w-6 text-blue-600 mx-auto" />
                      </div>
                      <p className="font-medium text-blue-800">{transfer.toLocation.name}</p>
                      <p className="text-xs text-blue-600">Destination</p>
                      {transfer.toLocation.address && (
                        <p className="text-xs text-muted-foreground mt-1">{transfer.toLocation.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">People Involved</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created by</p>
                      <p className="text-sm text-muted-foreground">{transfer.createdBy?.name || "Unknown"}</p>
                      {transfer.createdBy?.email && (
                        <p className="text-xs text-muted-foreground">{transfer.createdBy.email}</p>
                      )}
                    </div>
                  </div>
                  {transfer.approvedBy && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Approved by</p>
                        <p className="text-sm text-muted-foreground">{transfer.approvedBy.name || "Unknown"}</p>
                        {transfer.approvedBy.email && (
                          <p className="text-xs text-muted-foreground">{transfer.approvedBy.email}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {transfer.notes && (
            <div>
              <h3 className="font-medium mb-2">Transfer Notes</h3>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{transfer.notes}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Transfer Lines */}
          <div>
            <h3 className="font-medium mb-4">Transfer Items ({transfer.lines.length} SKUs)</h3>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Serial Numbers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfer.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{line.item.name}</p>
                          <p className="text-sm text-muted-foreground">{line.item.sku}</p>
                          {line.item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{line.item.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{line.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(line.item.costPrice || 0)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(line.quantity * (line.item.costPrice || 0))}
                      </TableCell>
                      <TableCell>
                        {line.notes ? (
                          <p className="text-sm">{line.notes}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">No notes</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {line.serialNumbers.length > 0 ? (
                          <div className="space-y-1">
                            {line.serialNumbers.map((serial, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {serial}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Total SKUs</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{transfer.lines.length}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Quantity</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{totalItems}</p>
              </div>
              <div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Package className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium">Estimated Value</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

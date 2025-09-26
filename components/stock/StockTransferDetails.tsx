"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useStockTransfer, useUpdateTransferStatus } from "@/hooks/useStockTransfer"
import { format } from "date-fns"
import { AlertCircle, ArrowRight, Calendar, MapPin, Package, Truck, User } from "lucide-react"

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  IN_TRANSIT: "bg-blue-100 text-blue-800 border-blue-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
}

const statusIcons = {
  PENDING: AlertCircle,
  IN_TRANSIT: Truck,
  COMPLETED: Package,
  CANCELLED: AlertCircle,
}

interface StockTransferDetailsProps {
  transferId: string
}

export function StockTransferDetails({ transferId }: StockTransferDetailsProps) {
  const { data: transfer, isLoading, error } = useStockTransfer(transferId)
  const updateStatus = useUpdateTransferStatus()

  const handleStatusUpdate = async (status: "PENDING" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED") => {
    try {
      await updateStatus.mutateAsync({ id: transferId, status })
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !transfer) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Transfer not found</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const StatusIcon = statusIcons[transfer.status]

  return (
    <div className="space-y-6">
      {/* Transfer Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Transfer {transfer.transferNumber}
              </CardTitle>
              <CardDescription>
                Created on {format(new Date(transfer.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
              </CardDescription>
            </div>
            <Badge className={`${statusColors[transfer.status]} border`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {transfer.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Route Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Transfer Route
              </h3>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="font-medium">{transfer.fromLocation?.name}</p>
                  <p className="text-xs text-muted-foreground">{transfer.fromLocation?.code}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <div className="text-center">
                  <p className="font-medium">{transfer.toLocation?.name}</p>
                  <p className="text-xs text-muted-foreground">{transfer.toLocation?.code}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div>
                    <p className="text-sm font-medium">Requested</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transfer.requestedAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                {transfer.approvedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transfer.approvedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
                {transfer.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm font-medium">Completed</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transfer.completedAt), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {transfer.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">{transfer.notes}</p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {transfer.status === "PENDING" && (
            <>
              <Separator className="my-4" />
              <div className="flex gap-3">
                <Button onClick={() => handleStatusUpdate("IN_TRANSIT")} disabled={updateStatus.isPending}>
                  Approve & Start Transit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                  disabled={updateStatus.isPending}
                >
                  Cancel Transfer
                </Button>
              </div>
            </>
          )}

          {transfer.status === "IN_TRANSIT" && (
            <>
              <Separator className="my-4" />
              <Button onClick={() => handleStatusUpdate("COMPLETED")} disabled={updateStatus.isPending}>
                Mark as Completed
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transfer Items */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Items</CardTitle>
          <CardDescription>Items included in this transfer with requested and transferred quantities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Transferred</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfer.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.item?.name || "Unknown Item"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.item?.sku || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.quantityRequested}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantityTransferred ? (
                        <Badge variant="secondary">{item.quantityTransferred}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Pending</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* People Involved */}
      <Card>
        <CardHeader>
          <CardTitle>People Involved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Requested By</p>
                <p className="text-xs text-muted-foreground">{transfer.requestedByUser?.name || "Unknown"}</p>
              </div>
            </div>
            {transfer.approvedByUser && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Approved By</p>
                  <p className="text-xs text-muted-foreground">{transfer.approvedByUser.name}</p>
                </div>
              </div>
            )}
            {transfer.completedByUser && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Completed By</p>
                  <p className="text-xs text-muted-foreground">{transfer.completedByUser.name}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

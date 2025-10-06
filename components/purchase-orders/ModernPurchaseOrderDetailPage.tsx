"use client"

import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatCurrency } from "@/lib/formatCurrency"
import { format, formatDate } from "date-fns"
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Download,
  Edit,
  FileText,
  History,
  MapPin,
  Package,
  Phone,
  PlayCircle,
  Receipt,
  RefreshCw,
  Send,
  ShoppingCart,
  Truck,
  User,
  XCircle,
  Zap
} from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { ModernStatusBadge } from "./ModernStatusBadge"

// Import real hooks
import {
  useApprovePurchaseOrder,
  useCancelPurchaseOrder,
  useClosePurchaseOrder,
  useDeletePurchaseOrder,
  useGoodsReceiptsForPurchaseOrder,
  usePurchaseOrderById,
  useReceiveItems,
  useSubmitPurchaseOrder
} from "@/hooks/useRecentPurchaseOrderQueries"

interface ModernPurchaseOrderDetailPageProps {
  id: string
  organizationId?: string
}

// Status configuration with modern styling
const getStatusConfig = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return {
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <FileText className="h-4 w-4" />,
        label: 'Draft',
        gradient: 'from-slate-500 to-slate-600'
      }
    case 'SUBMITTED':
      return {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700',
        icon: <PlayCircle className="h-4 w-4" />,
        label: 'Submitted',
        gradient: 'from-blue-500 to-cyan-500'
      }
    case 'APPROVED':
      return {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Approved',
        gradient: 'from-green-500 to-emerald-500'
      }
    case 'PARTIALLY_RECEIVED':
      return {
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700',
        icon: <Package className="h-4 w-4" />,
        label: 'Partially Received',
        gradient: 'from-orange-500 to-amber-500'
      }
    case 'RECEIVED':
      return {
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
        icon: <CheckCircle className="h-4 w-4" />,
        label: 'Received',
        gradient: 'from-emerald-500 to-teal-500'
      }
    case 'CANCELLED':
      return {
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700',
        icon: <XCircle className="h-4 w-4" />,
        label: 'Cancelled',
        gradient: 'from-red-500 to-rose-500'
      }
    default:
      return {
        color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: <AlertTriangle className="h-4 w-4" />,
        label: 'Unknown',
        gradient: 'from-slate-500 to-slate-600'
      }
  }
}

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  </div>
)

export default function ModernPurchaseOrderDetailPage({
  id,
  organizationId
}: ModernPurchaseOrderDetailPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: notifyError, info, warning } = useNotifications()
  const [activeTab, setActiveTab] = useState("overview")
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showReceiveDialog, setShowReceiveDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [receiveItems, setReceiveItems] = useState<Record<string, { quantity: number; received: number }>>({})

  // Hooks for data and mutations
  const { data: purchaseOrder, isLoading, error, refetch } = usePurchaseOrderById(id, organizationId)
  const { data: goodsReceipts, isLoading: receiptsLoading } = useGoodsReceiptsForPurchaseOrder(id, organizationId)
  const approveMutation = useApprovePurchaseOrder()
  const cancelMutation = useCancelPurchaseOrder()
  const deleteMutation = useDeletePurchaseOrder()
  const submitMutation = useSubmitPurchaseOrder()
  const receiveItemsMutation = useReceiveItems()
  const completeMutation = useClosePurchaseOrder()

  // Action handlers
  const handleApprove = useCallback(async () => {
    if (!purchaseOrder || !organizationId) return

    try {
      await approveMutation.mutateAsync({
        id: purchaseOrder.id,
        organizationId,
        approvedBy: user || null
      })
      setShowApproveDialog(false)
      success(
        "Order Approved",
        `Purchase order ${purchaseOrder.orderNumber} has been approved successfully`,
        { duration: 4000, sound: true }
      )
    } catch (error) {
      notifyError(
        "Approval Failed",
        "Failed to approve purchase order. Please try again.",
        { duration: 6000, sound: true }
      )
    }
  }, [purchaseOrder, organizationId, approveMutation])

  const handleCancel = useCallback(async () => {
    if (!purchaseOrder || !organizationId) return

    try {
      await cancelMutation.mutateAsync({
        id: purchaseOrder.id,
        organizationId,
        reason: cancelReason || 'Cancelled by user'
      })
      setShowCancelDialog(false)
      setCancelReason("")
      warning(
        "Order Cancelled",
        `Purchase order ${purchaseOrder.orderNumber} has been cancelled`,
        { duration: 4000, sound: true }
      )
    } catch (error) {
      notifyError(
        "Cancellation Failed",
        "Failed to cancel purchase order. Please try again.",
        { duration: 6000, sound: true }
      )
    }
  }, [purchaseOrder, organizationId, cancelMutation, cancelReason])

  const handleDownloadPDF = useCallback(() => {
    if (!purchaseOrder) return
    window.open(`/api/purchase-orders/${purchaseOrder.id}/pdf?organizationId=${organizationId}`, '_blank')
    info(
      "PDF Download",
      "PDF download has been initiated",
      { duration: 3000, sound: false }
    )
  }, [purchaseOrder, organizationId])

  const handleSubmit = useCallback(async () => {
    if (!purchaseOrder || !organizationId) return

    try {
      await submitMutation.mutateAsync({
        id: purchaseOrder.id,
        organizationId
      })
      setShowSubmitDialog(false)
      success(
        "Order Submitted",
        `Purchase order ${purchaseOrder.orderNumber} has been submitted for approval`,
        { duration: 4000, sound: true }
      )
    } catch (error) {
      notifyError(
        "Submission Failed",
        "Failed to submit purchase order. Please check your data and try again.",
        { duration: 6000, sound: true }
      )
    }
  }, [purchaseOrder, organizationId, submitMutation])

  // Calculate receiving totals
  const receivingTotals = useMemo(() => {
    const totalUnits = Object.values(receiveItems).reduce((sum, item) => sum + item.received, 0)
    const totalValue = Object.entries(receiveItems).reduce((sum, [lineId, data]) => {
      const line = purchaseOrder?.lines?.find(l => l.id === lineId)
      return sum + (line?.unitCost || 0) * data.received
    }, 0)
    const linesWithItems = Object.values(receiveItems).filter(item => item.received > 0).length

    return {
      totalUnits,
      totalValue,
      linesWithItems
    }
  }, [receiveItems, purchaseOrder?.lines])

  const handleReceive = useCallback(async () => {
    if (!purchaseOrder || !organizationId) return

    try {
      const itemsToReceive = Object.entries(receiveItems).map(([lineId, data]) => ({
        lineId,
        receivedQuantity: data.received
      }))

      await receiveItemsMutation.mutateAsync({
        id: purchaseOrder.id,
        organizationId,
        receivedBy: user || null,
        receivedById: user || 'system', // Fallback to system if no user
        notes: 'Items received via workflow',
        items: itemsToReceive
      })
      setShowReceiveDialog(false)
      setReceiveItems({})
      success(
        "Items Received",
        `Items for purchase order ${purchaseOrder.orderNumber} have been received successfully`,
        { duration: 4000, sound: true }
      )
    } catch (error) {
      notifyError(
        "Receiving Failed",
        "Failed to receive items. Please verify quantities and try again.",
        { duration: 6000, sound: true }
      )
    }
  }, [purchaseOrder, organizationId, receiveItemsMutation, receiveItems])

  const handleComplete = useCallback(async () => {
    if (!purchaseOrder || !organizationId) return

    try {
      await completeMutation.mutateAsync({
        id: purchaseOrder.id,
        organizationId
      })
      setShowCompleteDialog(false)
      success(
        "Order Completed",
        `Purchase order ${purchaseOrder.orderNumber} has been marked as completed`,
        { duration: 4000, sound: true }
      )
    } catch (error) {
      notifyError(
        "Completion Failed",
        "Failed to complete purchase order. Please try again.",
        { duration: 6000, sound: true }
      )
    }
  }, [purchaseOrder, organizationId, completeMutation])

  const handleClone = useCallback(() => {
    if (!purchaseOrder) return
    router.push(`/dashboard/purchase-orders/new?clone=${purchaseOrder.id}`)
    info(
      "Cloning Order",
      "Redirecting to create a new order based on this one",
      { duration: 3000, sound: false }
    )
  }, [purchaseOrder, router])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !purchaseOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <Card className="max-w-md mx-auto text-center p-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Purchase Order Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The purchase order you're looking for could not be found or may have been deleted.
            </p>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  const statusConfig = getStatusConfig(purchaseOrder.status)
  const isOverdue = purchaseOrder.expectedDeliveryDate &&
    new Date(purchaseOrder.expectedDeliveryDate) < new Date() &&
    !['RECEIVED', 'COMPLETED', 'CANCELLED'].includes(purchaseOrder.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Enhanced Header with POSTerminal styling */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-6 sm:mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 w-full">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${statusConfig.gradient} shadow-lg`}>
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {purchaseOrder.orderNumber}
                    </h1>
                    <div className="flex items-center gap-4 mt-1">
                      <ModernStatusBadge status={purchaseOrder.status} />
                      {isOverdue && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClone}
                className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
              >
                <Copy className="w-4 h-4 mr-2" />
                Clone
              </Button>

              {purchaseOrder.status === 'DRAFT' && (
                <Link href={`/dashboard/purchase-orders/${purchaseOrder.id}/edit`}>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </Link>
              )}

              {purchaseOrder.status === 'SUBMITTED' && (
                <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve Purchase Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to approve purchase order {purchaseOrder.orderNumber}?
                        This action will move the order to approved status.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {approveMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Submit Button - Only for DRAFT status */}
              {purchaseOrder.status === 'DRAFT' && (
                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Purchase Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to submit purchase order {purchaseOrder.orderNumber}?
                        This will send the order for approval.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {submitMutation.isPending ? "Submitting..." : "Submit Order"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Receive Items Button - For APPROVED and PARTIALLY_RECEIVED status */}
              {(purchaseOrder.status === 'APPROVED' || purchaseOrder.status === 'PARTIALLY_RECEIVED') && (
                <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Receive Items
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Receive Items - {purchaseOrder.orderNumber}</DialogTitle>
                      <DialogDescription>
                        Enter the quantity received for each item. You can receive items partially.
                      </DialogDescription>
                      {/* Bulk Actions */}
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newReceiveItems: Record<string, { quantity: number; received: number }> = {}
                            purchaseOrder.lines?.forEach(line => {
                              const maxAllowed = line.orderedQuantity - (line.receivedQuantity || 0)
                              if (maxAllowed > 0) {
                                newReceiveItems[line.id] = {
                                  quantity: line.orderedQuantity,
                                  received: maxAllowed
                                }
                              }
                            })
                            setReceiveItems(newReceiveItems)
                            success(
                              "All Items Selected",
                              "All available quantities have been set for receiving",
                              { duration: 3000, sound: false }
                            )
                          }}
                          className="text-sm px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                        >
                          Receive All Available
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReceiveItems({})
                            info(
                              "Quantities Cleared",
                              "All receive quantities have been reset to zero",
                              { duration: 3000, sound: false }
                            )
                          }}
                          className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {purchaseOrder.lines && purchaseOrder.lines.length > 0 ? (
                        <>
                          {/* Items Table */}
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Ordered Qty</TableHead>
                                <TableHead>Already Received</TableHead>
                                <TableHead>Receiving Now</TableHead>
                                <TableHead>Unit Cost</TableHead>
                                <TableHead>Line Total</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {purchaseOrder.lines.map((line) => (
                                <TableRow key={line.id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {line.item?.name || `Item ${line.itemId}`}
                                    </div>
                                    {line.item?.sku && (
                                      <div className="text-sm text-muted-foreground">
                                        SKU: {line.item.sku}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-medium">{line.orderedQuantity}</TableCell>
                                  <TableCell className="text-muted-foreground">{line.receivedQuantity || 0}</TableCell>
                                  <TableCell>
                                    <div className="space-y-1">
                                      <div className="relative">
                                        <input
                                          type="number"
                                          min="0"
                                          max={line.orderedQuantity - (line.receivedQuantity || 0)}
                                          className={`w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-orange-500 ${receiveItems[line.id]?.received > (line.orderedQuantity - (line.receivedQuantity || 0))
                                              ? 'border-red-500 bg-red-50'
                                              : 'border-gray-300'
                                            }`}
                                          value={receiveItems[line.id]?.received || 0}
                                          onChange={(e) => {
                                            const inputValue = parseInt(e.target.value) || 0
                                            const maxAllowed = line.orderedQuantity - (line.receivedQuantity || 0)

                                            // Hard limit enforcement
                                            const finalValue = Math.min(Math.max(0, inputValue), maxAllowed)

                                            // Show notification if user tried to exceed limit
                                            if (inputValue > maxAllowed && inputValue > 0) {
                                              warning(
                                                "Quantity Limited",
                                                `Maximum ${maxAllowed} units can be received for ${line.item?.name || 'this item'}. Input automatically adjusted.`,
                                                { duration: 5000, sound: true }
                                              )
                                            }

                                            setReceiveItems(prev => ({
                                              ...prev,
                                              [line.id]: {
                                                quantity: line.orderedQuantity,
                                                received: finalValue
                                              }
                                            }))
                                          }}
                                          onKeyDown={(e) => {
                                            // Allow: backspace, delete, tab, escape, enter
                                            if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                              // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                              (e.keyCode === 65 && e.ctrlKey === true) ||
                                              (e.keyCode === 67 && e.ctrlKey === true) ||
                                              (e.keyCode === 86 && e.ctrlKey === true) ||
                                              (e.keyCode === 88 && e.ctrlKey === true) ||
                                              // Allow: home, end, left, right
                                              (e.keyCode >= 35 && e.keyCode <= 39)) {
                                              return
                                            }
                                            // Ensure that it is a number and stop the keypress
                                            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                              e.preventDefault()
                                              info(
                                                "Numbers Only",
                                                "Please enter numeric values only",
                                                { duration: 2000, sound: false }
                                              )
                                            }
                                          }}
                                          onBlur={(e) => {
                                            // Additional validation on blur to ensure clean state
                                            const inputValue = parseInt(e.target.value) || 0
                                            const maxAllowed = line.orderedQuantity - (line.receivedQuantity || 0)
                                            const finalValue = Math.min(Math.max(0, inputValue), maxAllowed)

                                            if (inputValue !== finalValue) {
                                              setReceiveItems(prev => ({
                                                ...prev,
                                                [line.id]: {
                                                  quantity: line.orderedQuantity,
                                                  received: finalValue
                                                }
                                              }))
                                            }
                                          }}
                                        />
                                        {/* Max quantity indicator */}
                                        <div className="absolute -right-16 top-0 text-xs text-muted-foreground whitespace-nowrap">
                                          max: {line.orderedQuantity - (line.receivedQuantity || 0)}
                                        </div>
                                      </div>
                                      {/* Quick action buttons */}
                                      <div className="flex gap-1 mt-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const maxAllowed = line.orderedQuantity - (line.receivedQuantity || 0)
                                            setReceiveItems(prev => ({
                                              ...prev,
                                              [line.id]: {
                                                quantity: line.orderedQuantity,
                                                received: maxAllowed
                                              }
                                            }))
                                          }}
                                          className="text-xs px-1 py-0.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors"
                                          disabled={(line.orderedQuantity - (line.receivedQuantity || 0)) === 0}
                                        >
                                          All
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setReceiveItems(prev => ({
                                              ...prev,
                                              [line.id]: {
                                                quantity: line.orderedQuantity,
                                                received: 0
                                              }
                                            }))
                                          }}
                                          className="text-xs px-1 py-0.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                        >
                                          Clear
                                        </button>
                                      </div>
                                      {/* Validation message */}
                                      {receiveItems[line.id]?.received > (line.orderedQuantity - (line.receivedQuantity || 0)) && (
                                        <div className="text-xs text-red-500">
                                          Exceeds maximum ({line.orderedQuantity - (line.receivedQuantity || 0)})
                                        </div>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium text-green-600">
                                      {formatCurrency(line.unitCost || 0)}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold">
                                      {formatCurrency(line.lineTotal || (line.unitCost * line.orderedQuantity))}
                                    </div>
                                    {receiveItems[line.id]?.received > 0 && (
                                      <div className="text-sm text-muted-foreground">
                                        Receiving: {formatCurrency((line.unitCost || 0) * (receiveItems[line.id]?.received || 0))}
                                      </div>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>

                          {/* Summary Section */}
                          <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                            <h4 className="font-semibold mb-3">Receiving Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="flex justify-between">
                                  <span>Total Order Value:</span>
                                  <span className="font-medium">{formatCurrency(purchaseOrder.total || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Items to Receive:</span>
                                  <span className="font-medium">
                                    {receivingTotals.totalUnits} units
                                  </span>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between">
                                  <span>Value Receiving:</span>
                                  <span className="font-semibold text-orange-600">
                                    {formatCurrency(receivingTotals.totalValue)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lines with Items:</span>
                                  <span className="font-medium">
                                    {receivingTotals.linesWithItems} of {purchaseOrder.lines?.length || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>No items found in this purchase order</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 mt-4">
                      {Object.values(receiveItems).every(item => item.received === 0) && (
                        <p className="text-sm text-muted-foreground text-center">
                          Enter quantities above to enable receiving
                        </p>
                      )}
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowReceiveDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleReceive}
                          disabled={
                            receiveItemsMutation.isPending ||
                            Object.values(receiveItems).every(item => item.received === 0)
                          }
                          className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                        >
                          {receiveItemsMutation.isPending ? "Receiving..." : "Receive Items"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Force Complete Button - For PARTIALLY_RECEIVED status */}
              {purchaseOrder.status === 'PARTIALLY_RECEIVED' && (
                <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-600 text-amber-700 hover:bg-amber-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Force Complete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Force Complete Purchase Order</DialogTitle>
                      <DialogDescription>
                        This order is only partially received. Are you sure you want to mark it as completed?
                        This will close the order and prevent further receiving.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={completeMutation.isPending}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        {completeMutation.isPending ? "Completing..." : "Force Complete"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {/* Complete Order Button - Only for RECEIVED status */}
              {purchaseOrder.status === 'RECEIVED' && (
                <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Order
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Purchase Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to mark purchase order {purchaseOrder.orderNumber} as completed?
                        This will finalize the order and close it.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={completeMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {completeMutation.isPending ? "Completing..." : "Complete Order"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {!['RECEIVED', 'COMPLETED', 'CANCELLED'].includes(purchaseOrder.status) && (
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Purchase Order</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel purchase order {purchaseOrder.orderNumber}?
                        This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <label className="text-sm font-medium">Reason for cancellation (optional)</label>
                        <Textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Enter reason for cancellation..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                          Keep Order
                        </Button>
                        <Button
                          onClick={handleCancel}
                          disabled={cancelMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {cancelMutation.isPending ? "Cancelling..." : "Cancel Order"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardHeader className="pb-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Total Amount
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {formatCurrency(purchaseOrder.total)}
              </div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-blue-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Order value</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Package className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardHeader className="pb-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Line Items
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {purchaseOrder.lines?.length || 0}
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-3 h-3 text-purple-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Products ordered</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Expected Delivery
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {purchaseOrder.expectedDeliveryDate
                  ? format(new Date(purchaseOrder.expectedDeliveryDate), 'MMM dd, yyyy')
                  : 'Not set'
                }
              </div>
              <div className="flex items-center gap-1">
                {isOverdue ? (
                  <>
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <p className="text-xs text-red-600 dark:text-red-400">Overdue</p>
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">On schedule</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
            <div className="absolute top-3 right-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardHeader className="pb-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Order Date
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {format(new Date(purchaseOrder.orderDate), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">Created</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content with POSTerminal styling */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 px-6 py-5 border-b border-emerald-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase Order Details</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {purchaseOrder.orderNumber} • {formatCurrency(purchaseOrder.total || 0)} • {purchaseOrder.lines?.length || 0} items
                  </p>
                </div>
              </div>
            </div>
          </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="px-6 py-4 border-b border-emerald-200/60 dark:border-slate-700/60">
              <TabsList className="bg-transparent p-0 h-auto">
                <TabsTrigger
                  value="overview"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="items"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Line Items
                </TabsTrigger>
                <TabsTrigger
                  value="receipts"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Receipts
                </TabsTrigger>
                <TabsTrigger
                  value="inventory"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Inventory
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg px-4 py-2 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400"
                >
                  <History className="w-4 h-4 mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
          </div>

            <div className="p-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Order Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Supplier and Location Info */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Supplier & Delivery Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                              Supplier
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{purchaseOrder.supplier?.name || 'Unknown Supplier'}</span>
                              </div>
                              {purchaseOrder.supplier?.email && (
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">{purchaseOrder.supplier.email}</span>
                                </div>
                              )}
                              {purchaseOrder.supplier?.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">{purchaseOrder.supplier.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                              Delivery Location
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span className="font-medium">{purchaseOrder.location?.name || 'Unknown Location'}</span>
                              </div>
                              {purchaseOrder.location?.address && (
                                <div className="flex items-start gap-2">
                                  <Building2 className="w-4 h-4 text-slate-400 mt-0.5" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">{purchaseOrder.location.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Details */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Order Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {purchaseOrder?.expectedDeliveryDate && (
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Expected Delivery Date</label>
                              <p className="text-slate-900 dark:text-white">{formatDate(purchaseOrder.expectedDeliveryDate, "dd/MM/yyyy")}</p>
                            </div>
                          )}
                          {purchaseOrder.notes && (
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Notes</label>
                              <p className="text-slate-900 dark:text-white whitespace-pre-wrap">{purchaseOrder.notes}</p>
                            </div>
                          )}
                          {purchaseOrder.createdBy && (
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created By</label>
                              <p className="text-slate-900 dark:text-white">{purchaseOrder.createdBy.name}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Summary Sidebar */}
                  <div className="space-y-6">
                    {/* Financial Summary */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5" />
                          Financial Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                            <span className="font-medium">{formatCurrency(purchaseOrder.subtotal)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Tax</span>
                            <span className="font-medium">{formatCurrency(purchaseOrder.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                            <span className="font-medium">{formatCurrency(purchaseOrder.shippingCost)}</span>
                          </div>
                          {purchaseOrder.discount > 0 && (
                            <div className="flex justify-between">
                              <span className="text-slate-600 dark:text-slate-400">Discount</span>
                              <span className="font-medium text-green-600">-{formatCurrency(purchaseOrder.discount)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between text-lg font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(purchaseOrder.total)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Quick Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleDownloadPDF}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleClone}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Clone Order
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => refetch()}
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Line Items Tab */}
              <TabsContent value="items" className="mt-0">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Order Line Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-200 dark:border-slate-700">
                            <TableHead className="font-semibold">Item</TableHead>
                            <TableHead className="font-semibold">Ordered</TableHead>
                            <TableHead className="font-semibold">Received</TableHead>
                            <TableHead className="font-semibold">Unit Cost</TableHead>
                            <TableHead className="font-semibold">Tax</TableHead>
                            <TableHead className="font-semibold text-right">Line Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {purchaseOrder.lines?.map((line) => (
                            <TableRow key={line.id} className="border-slate-200 dark:border-slate-700">
                              <TableCell>
                                <div>
                                  <div className="font-medium">{line.item?.name || 'Unknown Item'}</div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    SKU: {line.item?.sku || 'N/A'}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{line.orderedQuantity}</TableCell>
                              <TableCell className="font-medium">{line.receivedQuantity || 0}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(line.unitCost)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(line.taxAmount || 0)}</TableCell>
                              <TableCell className="font-medium text-right">{formatCurrency(line.lineTotal)}</TableCell>
                            </TableRow>
                          ))}
                          {(!purchaseOrder.lines || purchaseOrder.lines.length === 0) && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">
                                No line items found
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Receipts Tab */}
              <TabsContent value="receipts" className="mt-0">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="w-5 h-5" />
                      Goods Receipts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {receiptsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-16" />
                        ))}
                      </div>
                    ) : goodsReceipts && goodsReceipts.length > 0 ? (
                      <div className="space-y-4">
                        {goodsReceipts.map((receipt) => (
                          <div key={receipt.id} className="border rounded-lg p-4 bg-white/30">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold">Receipt #{receipt.receiptNumber || receipt.id}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Received on {formatDate(new Date(receipt.createdAt), 'PPP')} at {format(new Date(receipt.createdAt), 'p')}
                                </p>
                                {receipt.receivedBy && (
                                  <p className="text-sm text-muted-foreground">
                                    Received by: {receipt.receivedBy.name || receipt.receivedBy.email}
                                  </p>
                                )}
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Received
                              </Badge>
                            </div>
                            {receipt.notes && (
                              <p className="text-sm text-muted-foreground mb-3">
                                <strong>Notes:</strong> {receipt.notes}
                              </p>
                            )}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">Items Received:</h5>
                              {receipt.lines?.map((line) => (
                                <div key={line.id} className="flex justify-between items-center py-1 px-3 bg-slate-50 rounded text-sm">
                                  <span className="font-medium">{line.item?.name || `Item ${line.itemId}`}</span>
                                  <span className="text-muted-foreground">
                                    Qty: {line.receivedQuantity}
                                    {line.unitCost && (
                                      <span className="ml-2">
                                        @ {formatCurrency(line.unitCost)} = {formatCurrency(line.unitCost * line.receivedQuantity)}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No goods receipts found</p>
                        <p className="text-sm">Receipts will appear here when items are received</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Inventory Tab */}
              <TabsContent value="inventory" className="mt-0">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Inventory Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {purchaseOrder.lines?.map((line) => (
                        <div key={line.id} className="border rounded-lg p-4 bg-white/30">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{line.item?.name || `Item ${line.itemId}`}</h4>
                              {line.item?.sku && (
                                <p className="text-sm text-muted-foreground">SKU: {line.item.sku}</p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-3 bg-blue-50 rounded">
                              <div className="font-semibold text-blue-700">{line.orderedQuantity}</div>
                              <div className="text-blue-600">Ordered</div>
                            </div>

                            <div className="text-center p-3 bg-green-50 rounded">
                              <div className="font-semibold text-green-700">{line.receivedQuantity || 0}</div>
                              <div className="text-green-600">Received</div>
                            </div>

                            <div className="text-center p-3 bg-orange-50 rounded">
                              <div className="font-semibold text-orange-700">
                                {line.orderedQuantity - (line.receivedQuantity || 0)}
                              </div>
                              <div className="text-orange-600">Pending</div>
                            </div>

                            <div className="text-center p-3 bg-slate-50 rounded">
                              <div className="font-semibold text-slate-700">
                                {formatCurrency(line.unitCost * (line.receivedQuantity || 0))}
                              </div>
                              <div className="text-slate-600">Value Received</div>
                            </div>
                          </div>

                          {line.receivedQuantity && line.receivedQuantity > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs text-muted-foreground">
                                <strong>Inventory Updated:</strong> Added {line.receivedQuantity} units to inventory at {formatCurrency(line.unitCost)} each
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Summary */}
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-700">
                              {purchaseOrder.lines?.reduce((sum, line) => sum + line.orderedQuantity, 0) || 0}
                            </div>
                            <div className="text-sm text-blue-600">Total Units Ordered</div>
                          </div>

                          <div className="p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-700">
                              {purchaseOrder.lines?.reduce((sum, line) => sum + (line.receivedQuantity || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-green-600">Total Units Received</div>
                          </div>

                          <div className="p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-700">
                              {purchaseOrder.lines?.reduce((sum, line) => sum + (line.orderedQuantity - (line.receivedQuantity || 0)), 0) || 0}
                            </div>
                            <div className="text-sm text-orange-600">Units Pending</div>
                          </div>

                          <div className="p-4 bg-slate-50 rounded-lg">
                            <div className="text-2xl font-bold text-slate-700">
                              {formatCurrency(purchaseOrder.lines?.reduce((sum, line) => sum + (line.unitCost * (line.receivedQuantity || 0)), 0) || 0)}
                            </div>
                            <div className="text-sm text-slate-600">Inventory Value Added</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-0">
                <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      Status History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">Order Created</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {purchaseOrder?.createdAt
                              ? format(new Date(purchaseOrder.createdAt), 'MMM dd, yyyy at h:mm a')
                              : 'Date not available'}
                          </div>
                        </div>
                      </div>
                      {purchaseOrder.status !== 'DRAFT' && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Status: {statusConfig.label}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Current status</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
            </Tabs>
        </Card>
      </div>
    </div>
  )
}
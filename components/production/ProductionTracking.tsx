"use client"

import { notify } from "@/lib/notifications/notify"
import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Play,
  Pause,
  Square,
  Settings,
  Thermometer,
  Timer,
  Users,
  Zap,
  ArrowRight,
  PackageCheck,
  Scale,
  Target,
  TrendingUp,
  ClipboardList,
  Factory
} from 'lucide-react'
import {
  ProductionBatch,
  ProductionStatus,
  RawMaterialUsage,
  FinishedProduct,
  ProductionCost,
  PRODUCTION_STATUS_COLORS,
  getProductionStatusLabel,
  formatCurrency,
} from '@/types/production'

interface ProductionTrackingProps {
  organizationId: string
}

interface ActiveBatch extends ProductionBatch {
  recipe: {
    name: string
    totalTime: number
    ingredients: Array<{
      rawMaterial: { name: string; unitOfMeasure: string }
      quantity: number
    }>
  }
  rawMaterialUsage: RawMaterialUsage[]
  finishedProducts: FinishedProduct[]
}

interface InventoryConversion {
  id: string
  batchId: string
  rawMaterialId: string
  rawMaterialName: string
  quantityUsed: number
  unitCost: number
  totalCost: number
  timestamp: Date
}

export default function ProductionTracking({ organizationId }: ProductionTrackingProps) {
  const [activeBatches, setActiveBatches] = useState<ActiveBatch[]>([])
  const [selectedBatch, setSelectedBatch] = useState<ActiveBatch | null>(null)
  const [inventoryConversions, setInventoryConversions] = useState<InventoryConversion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Batch tracking state
  const [trackingData, setTrackingData] = useState({
    actualYield: '',
    qualityScore: '',
    qualityNotes: '',
    productionNotes: '',
    wasteAmount: '',
    wasteReason: '',
  })

  useEffect(() => {
    fetchActiveBatches()
    fetchInventoryConversions()
  }, [organizationId])

  const fetchActiveBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/production/batches/active?organizationId=${organizationId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch active batches')
      }

      const data = await response.json()
      setActiveBatches(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load active batches')
      console.error('Error fetching active batches:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchInventoryConversions = async () => {
    try {
      const response = await fetch(`/api/production/inventory/conversions?organizationId=${organizationId}&limit=50`)

      if (!response.ok) {
        throw new Error('Failed to fetch inventory conversions')
      }

      const data = await response.json()
      setInventoryConversions(data)
    } catch (err) {
      console.error('Error fetching inventory conversions:', err)
    }
  }

  const updateBatchStatus = async (batchId: string, newStatus: ProductionStatus, additionalData?: any) => {
    try {
      const response = await fetch('/api/production/batches/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          status: newStatus,
          organizationId,
          ...additionalData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update batch status')
      }

      await fetchActiveBatches()
      await fetchInventoryConversions()
      notify.success(`Batch status updated to ${getProductionStatusLabel(newStatus)}`)
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to update batch status')
    }
  }

  const startBatch = (batch: ActiveBatch) => {
    updateBatchStatus(batch.id, ProductionStatus.IN_PROGRESS, {
      actualStartTime: new Date(),
    })
  }

  const pauseBatch = (batch: ActiveBatch) => {
    updateBatchStatus(batch.id, ProductionStatus.ON_HOLD)
  }

  const moveToQualityCheck = (batch: ActiveBatch) => {
    updateBatchStatus(batch.id, ProductionStatus.QUALITY_CHECK, {
      actualEndTime: new Date(),
      quantityProduced: parseFloat(trackingData.actualYield) || batch.quantityPlanned,
      productionNotes: trackingData.productionNotes,
      wasteAmount: parseFloat(trackingData.wasteAmount) || 0,
      wasteReason: trackingData.wasteReason,
    })
  }

  const completeBatch = (batch: ActiveBatch) => {
    updateBatchStatus(batch.id, ProductionStatus.COMPLETED, {
      qualityScore: parseFloat(trackingData.qualityScore),
      qualityCheckNotes: trackingData.qualityNotes,
      qualityCheckDate: new Date(),
      quantityYield: parseFloat(trackingData.actualYield) || batch.quantityPlanned,
      yieldPercentage: ((parseFloat(trackingData.actualYield) || batch.quantityPlanned) / batch.quantityPlanned) * 100,
    })
  }

  const recordMaterialUsage = async (batchId: string, materialId: string, quantity: number) => {
    try {
      const response = await fetch('/api/production/materials/record-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          materialId,
          quantity,
          organizationId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to record material usage')
      }

      await fetchInventoryConversions()
      notify.success('Material usage recorded and inventory updated')
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed to record material usage')
    }
  }

  const getStatusIcon = (status: ProductionStatus) => {
    switch (status) {
      case ProductionStatus.PLANNED:
        return <Clock className="h-4 w-4" />
      case ProductionStatus.IN_PROGRESS:
        return <Play className="h-4 w-4" />
      case ProductionStatus.QUALITY_CHECK:
        return <CheckCircle className="h-4 w-4" />
      case ProductionStatus.COMPLETED:
        return <PackageCheck className="h-4 w-4" />
      case ProductionStatus.ON_HOLD:
        return <Pause className="h-4 w-4" />
      case ProductionStatus.CANCELLED:
        return <Square className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getProgressPercentage = (batch: ActiveBatch) => {
    switch (batch.status) {
      case ProductionStatus.PLANNED:
        return 0
      case ProductionStatus.IN_PROGRESS:
        return 50
      case ProductionStatus.QUALITY_CHECK:
        return 80
      case ProductionStatus.COMPLETED:
        return 100
      case ProductionStatus.ON_HOLD:
        return 25
      case ProductionStatus.CANCELLED:
        return 0
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Factory className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading production tracking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Error Loading Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchActiveBatches} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Tracking</h1>
          <p className="text-gray-600">Monitor active production batches and inventory conversions</p>
        </div>

        <Badge variant="outline" className="text-lg px-3 py-1">
          {activeBatches.length} Active Batches
        </Badge>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Batches</TabsTrigger>
          <TabsTrigger value="conversions">Inventory Conversions</TabsTrigger>
          <TabsTrigger value="tracking">Batch Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeBatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Factory className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Batches</h3>
                <p className="text-gray-600 text-center">No production batches are currently in progress.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeBatches.map((batch) => (
                <Card key={batch.id} className="relative overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{batch.recipe.name}</CardTitle>
                      <Badge className={PRODUCTION_STATUS_COLORS[batch.status]}>
                        {getStatusIcon(batch.status)}
                        <span className="ml-1">{getProductionStatusLabel(batch.status)}</span>
                      </Badge>
                    </div>
                    <CardDescription>Batch #{batch.batchNumber}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{getProgressPercentage(batch)}%</span>
                      </div>
                      <Progress value={getProgressPercentage(batch)} />
                    </div>

                    {/* Batch Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-gray-500">Quantity Planned</Label>
                        <p className="font-medium">{batch.quantityPlanned} units</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Estimated Cost</Label>
                        <p className="font-medium">{formatCurrency(batch.totalCost)}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Scheduled Start</Label>
                        <p className="font-medium">
                          {new Date(batch.scheduledStartTime).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Estimated Duration</Label>
                        <p className="font-medium">{batch.recipe.totalTime} mins</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {batch.status === ProductionStatus.PLANNED && (
                        <Button onClick={() => startBatch(batch)} size="sm">
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}

                      {batch.status === ProductionStatus.IN_PROGRESS && (
                        <>
                          <Button onClick={() => pauseBatch(batch)} variant="outline" size="sm">
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button onClick={() => setSelectedBatch(batch)} size="sm">
                                <Target className="h-4 w-4 mr-1" />
                                Quality Check
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Move to Quality Check</DialogTitle>
                                <DialogDescription>
                                  Record production details before quality inspection
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="actualYield">Actual Yield</Label>
                                  <Input
                                    id="actualYield"
                                    type="number"
                                    placeholder={`Expected: ${batch.quantityPlanned}`}
                                    value={trackingData.actualYield}
                                    onChange={(e) => setTrackingData(prev => ({ ...prev, actualYield: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="productionNotes">Production Notes</Label>
                                  <Textarea
                                    id="productionNotes"
                                    placeholder="Any observations or issues during production..."
                                    value={trackingData.productionNotes}
                                    onChange={(e) => setTrackingData(prev => ({ ...prev, productionNotes: e.target.value }))}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <Label htmlFor="wasteAmount">Waste Amount</Label>
                                    <Input
                                      id="wasteAmount"
                                      type="number"
                                      placeholder="0"
                                      value={trackingData.wasteAmount}
                                      onChange={(e) => setTrackingData(prev => ({ ...prev, wasteAmount: e.target.value }))}
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="wasteReason">Waste Reason</Label>
                                    <Select value={trackingData.wasteReason} onValueChange={(value) => setTrackingData(prev => ({ ...prev, wasteReason: value }))}>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="overcooking">Overcooking</SelectItem>
                                        <SelectItem value="undercooking">Undercooking</SelectItem>
                                        <SelectItem value="ingredient_spoilage">Ingredient Spoilage</SelectItem>
                                        <SelectItem value="equipment_failure">Equipment Failure</SelectItem>
                                        <SelectItem value="human_error">Human Error</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <Button onClick={() => moveToQualityCheck(batch)} className="w-full">
                                  Move to Quality Check
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {batch.status === ProductionStatus.QUALITY_CHECK && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedBatch(batch)} size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Production</DialogTitle>
                              <DialogDescription>
                                Record quality assessment and finalize the batch
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="qualityScore">Quality Score (1-10)</Label>
                                <Input
                                  id="qualityScore"
                                  type="number"
                                  min="1"
                                  max="10"
                                  placeholder="8"
                                  value={trackingData.qualityScore}
                                  onChange={(e) => setTrackingData(prev => ({ ...prev, qualityScore: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label htmlFor="qualityNotes">Quality Assessment Notes</Label>
                                <Textarea
                                  id="qualityNotes"
                                  placeholder="Quality assessment details..."
                                  value={trackingData.qualityNotes}
                                  onChange={(e) => setTrackingData(prev => ({ ...prev, qualityNotes: e.target.value }))}
                                />
                              </div>
                              <Button onClick={() => completeBatch(batch)} className="w-full">
                                Complete Batch
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>{batch.recipe.name} - Batch #{batch.batchNumber}</DialogTitle>
                            <DialogDescription>Complete batch information and ingredients</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-gray-500">Status</Label>
                                <Badge className={PRODUCTION_STATUS_COLORS[batch.status]}>
                                  {getProductionStatusLabel(batch.status)}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-gray-500">Priority</Label>
                                <Badge variant="outline">{batch.priority}</Badge>
                              </div>
                            </div>

                            <div>
                              <Label className="text-gray-500">Required Ingredients</Label>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Ingredient</TableHead>
                                    <TableHead>Required</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead>Action</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {batch.recipe.ingredients.map((ingredient, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{ingredient.rawMaterial.name}</TableCell>
                                      <TableCell>{ingredient.quantity}</TableCell>
                                      <TableCell>{ingredient.rawMaterial.unitOfMeasure}</TableCell>
                                      <TableCell>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => recordMaterialUsage(batch.id, 'material-id', ingredient.quantity)}
                                        >
                                          <Scale className="h-4 w-4 mr-1" />
                                          Record Usage
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Inventory Conversions</CardTitle>
              <CardDescription>Raw materials converted to finished products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity Used</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryConversions.map((conversion) => (
                    <TableRow key={conversion.id}>
                      <TableCell className="font-medium">{conversion.rawMaterialName}</TableCell>
                      <TableCell>{conversion.quantityUsed}</TableCell>
                      <TableCell>{formatCurrency(conversion.unitCost)}</TableCell>
                      <TableCell>{formatCurrency(conversion.totalCost)}</TableCell>
                      <TableCell>#{conversion.batchId.slice(-6)}</TableCell>
                      <TableCell>{new Date(conversion.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Real-time Production Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
                <CardDescription>Live production statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{activeBatches.length}</div>
                  <p className="text-sm text-gray-600">Active Batches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeBatches.filter(b => b.status === ProductionStatus.IN_PROGRESS).length}
                  </div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {activeBatches.filter(b => b.status === ProductionStatus.QUALITY_CHECK).length}
                  </div>
                  <p className="text-sm text-gray-600">Quality Check</p>
                </div>
              </CardContent>
            </Card>

            {/* Today's Production Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>Production performance today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeBatches.filter(b => b.status === ProductionStatus.COMPLETED &&
                      new Date(b.actualEndTime || '').toDateString() === new Date().toDateString()).length}
                  </div>
                  <p className="text-sm text-gray-600">Completed Batches</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {activeBatches.reduce((sum, batch) =>
                      batch.status === ProductionStatus.COMPLETED &&
                      new Date(batch.actualEndTime || '').toDateString() === new Date().toDateString()
                        ? sum + batch.quantityProduced : sum, 0
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Units Produced</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">85.2%</div>
                  <p className="text-sm text-gray-600">Efficiency Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* Alerts and Notifications */}
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Production alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {activeBatches.filter(b => b.status === ProductionStatus.ON_HOLD).length > 0 && (
                  <div className="flex items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      {activeBatches.filter(b => b.status === ProductionStatus.ON_HOLD).length} batch(es) on hold
                    </span>
                  </div>
                )}

                {activeBatches.filter(b =>
                  new Date(b.scheduledEndTime) < new Date() &&
                  b.status === ProductionStatus.IN_PROGRESS
                ).length > 0 && (
                  <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded">
                    <Clock className="h-4 w-4 text-red-600 mr-2" />
                    <span className="text-sm text-red-800">
                      {activeBatches.filter(b =>
                        new Date(b.scheduledEndTime) < new Date() &&
                        b.status === ProductionStatus.IN_PROGRESS
                      ).length} batch(es) overdue
                    </span>
                  </div>
                )}

                <div className="flex items-center p-2 bg-blue-50 border border-blue-200 rounded">
                  <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Production efficiency up 5% this week
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
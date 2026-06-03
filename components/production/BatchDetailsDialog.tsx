"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Factory,
  Calendar,
  Clock,
  User,
  MapPin,
  Package,
  DollarSign,
  TrendingUp,
  ChefHat,
  Play,
  CheckCircle,
  Timer,
  Star,
  AlertTriangle,
  FileText
} from 'lucide-react'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { startProductionBatch, completeProductionBatch } from '@/actions/production/productionSystemActions'
import { formatCurrency, formatNumber, formatPercentage, getRelativeTime } from '@/lib/utils'

interface ProductionBatch {
  id: string
  batchNumber: string
  recipeId: string
  quantityPlanned: number
  quantityProduced: number
  yieldPercentage: number
  status: string
  priority: string
  scheduledStartTime: Date
  scheduledEndTime: Date
  actualStartTime?: Date | null
  actualEndTime?: Date | null
  locationId: string
  assignedToId?: string | null
  supervisorId?: string | null
  totalCost: number
  costPerUnit: number
  qualityScore?: number | null
  productionNotes?: string | null
  recipe?: {
    name: string
    category: string
    yields: number
    yieldUnit: string
  }
  location?: {
    name: string
    code: string
  }
  assignedTo?: {
    name: string
    email: string
  } | null
  supervisor?: {
    name: string
    email: string
  } | null
}

interface BatchDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  batch: ProductionBatch
  organizationId: string
  currentUserId: string
}

export function BatchDetailsDialog({
  isOpen,
  onClose,
  batch,
  organizationId,
  currentUserId
}: BatchDetailsDialogProps) {
  const notifications = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Completion form state
  const [completionData, setCompletionData] = useState({
    quantityProduced: batch.quantityProduced.toString(),
    qualityScore: '8',
    notes: ''
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700'
      case 'IN_PROGRESS': return 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
      case 'QUALITY_CHECK': return 'bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700'
      case 'COMPLETED': return 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
      case 'CANCELLED': return 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'ON_HOLD': return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
      default: return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
      case 'MEDIUM': return 'bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-700'
      case 'LOW': return 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
      default: return 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
    }
  }

  const handleStartBatch = async () => {
    setIsLoading(true)
    try {
      const result = await startProductionBatch(batch.id, organizationId, currentUserId)

      if (result.success) {
        notifications.success('Success', 'Production batch started successfully')
        window.location.reload() // Refresh to show updated status
      } else {
        notifications.error('Error', result.error || 'Failed to start production batch')
      }
    } catch (error) {
      console.error('Error starting batch:', error)
      notifications.error('Error', 'Failed to start production batch')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteBatch = async () => {
    if (!completionData.quantityProduced) {
      notifications.error('Validation Error', 'Please enter quantity produced')
      return
    }

    setIsLoading(true)
    try {
      const result = await completeProductionBatch(
        batch.id,
        parseFloat(completionData.quantityProduced),
        parseFloat(completionData.qualityScore),
        completionData.notes,
        organizationId,
        currentUserId
      )

      if (result.success) {
        notifications.success('Success', 'Production batch completed successfully')
        onClose()
        window.location.reload() // Refresh to show updated status
      } else {
        notifications.error('Error', result.error || 'Failed to complete production batch')
      }
    } catch (error) {
      console.error('Error completing batch:', error)
      notifications.error('Error', 'Failed to complete production batch')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateActualCostPerUnit = () => {
    const producedQty = parseFloat(completionData.quantityProduced) || batch.quantityProduced
    return producedQty > 0 ? batch.totalCost / producedQty : 0
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-emerald-500/5 rounded-xl"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <Factory className="h-6 w-6 text-white" />
            </div>
            Production Batch Details
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 text-base font-medium">
            {batch.batchNumber} - {batch.recipe?.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 relative z-10">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-1.5">
            <TabsTrigger value="overview" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
              Overview
            </TabsTrigger>
            <TabsTrigger value="recipe" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
              Recipe
            </TabsTrigger>
            <TabsTrigger value="timeline" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
              Timeline
            </TabsTrigger>
            <TabsTrigger value="actions" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
              Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Status and Priority */}
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className={`font-semibold px-4 py-2 rounded-xl ${getStatusColor(batch.status)}`}>
                {batch.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className={`font-semibold px-4 py-2 rounded-xl ${getPriorityColor(batch.priority)}`}>
                {batch.priority} Priority
              </Badge>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Production Progress</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    {batch.quantityProduced}/{batch.quantityPlanned}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {batch.recipe?.yieldUnit} • {formatPercentage(batch.yieldPercentage)} yield
                  </p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Cost</CardTitle>
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{formatCurrency(batch.totalCost)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(batch.costPerUnit)}/unit
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {batch.qualityScore ? `${batch.qualityScore}/10` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Quality rating</p>
                </CardContent>
              </Card>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Recipe</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <ChefHat className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{batch.recipe?.name}</span>
                  </div>
                  <p className="text-sm text-gray-500">{batch.recipe?.category}</p>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Location</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{batch.location?.name || 'Default Location'}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Assigned To</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {batch.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-gray-600">Scheduled Start</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(batch.scheduledStartTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Scheduled End</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(batch.scheduledEndTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-gray-600">Supervisor</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {batch.supervisor?.name || 'None assigned'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Production Notes */}
            {batch.productionNotes && (
              <div>
                <Label className="text-sm text-gray-600">Production Notes</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{batch.productionNotes}</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recipe" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recipe Information</CardTitle>
                <CardDescription>Details about the recipe used for this batch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Recipe Name</Label>
                    <p className="font-medium">{batch.recipe?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Category</Label>
                    <p className="font-medium">{batch.recipe?.category}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Standard Yield</Label>
                    <p className="font-medium">{batch.recipe?.yields} {batch.recipe?.yieldUnit}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Scaling Factor</Label>
                    <p className="font-medium">
                      {batch.recipe?.yields ? (batch.quantityPlanned / batch.recipe.yields).toFixed(2) : 'N/A'}x
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Production Timeline</CardTitle>
                <CardDescription>Track the progress and timing of this batch</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">Batch Planned</p>
                      <p className="text-sm text-gray-500">
                        Scheduled for {new Date(batch.scheduledStartTime).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {batch.actualStartTime && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Production Started</p>
                        <p className="text-sm text-gray-500">
                          {new Date(batch.actualStartTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {batch.actualEndTime && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium">Production Completed</p>
                        <p className="text-sm text-gray-500">
                          {new Date(batch.actualEndTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            {batch.status === 'PLANNED' && (
              <Card>
                <CardHeader>
                  <CardTitle>Start Production</CardTitle>
                  <CardDescription>Begin production for this batch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleStartBatch}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isLoading ? 'Starting...' : 'Start Production'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {(batch.status === 'IN_PROGRESS' || batch.status === 'QUALITY_CHECK') && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Production</CardTitle>
                  <CardDescription>Mark this batch as completed with final details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantityProduced">Quantity Produced *</Label>
                      <Input
                        id="quantityProduced"
                        type="number"
                        value={completionData.quantityProduced}
                        onChange={(e) => setCompletionData(prev => ({
                          ...prev,
                          quantityProduced: e.target.value
                        }))}
                        placeholder="Enter actual quantity produced"
                      />
                    </div>

                    <div>
                      <Label htmlFor="qualityScore">Quality Score (1-10)</Label>
                      <Input
                        id="qualityScore"
                        type="number"
                        min="1"
                        max="10"
                        value={completionData.qualityScore}
                        onChange={(e) => setCompletionData(prev => ({
                          ...prev,
                          qualityScore: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="completionNotes">Quality Check Notes</Label>
                    <Textarea
                      id="completionNotes"
                      rows={3}
                      value={completionData.notes}
                      onChange={(e) => setCompletionData(prev => ({
                        ...prev,
                        notes: e.target.value
                      }))}
                      placeholder="Enter any quality observations or notes..."
                    />
                  </div>

                  {completionData.quantityProduced && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <Label className="text-gray-600">Yield Percentage</Label>
                          <p className="font-medium">
                            {formatPercentage((parseFloat(completionData.quantityProduced) / batch.quantityPlanned) * 100)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Actual Cost/Unit</Label>
                          <p className="font-medium">{formatCurrency(calculateActualCostPerUnit())}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Total Cost</Label>
                          <p className="font-medium">{formatCurrency(batch.totalCost)}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCompleteBatch}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isLoading ? 'Completing...' : 'Complete Batch'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {batch.status === 'COMPLETED' && (
              <Card>
                <CardHeader>
                  <CardTitle>Batch Completed</CardTitle>
                  <CardDescription>This batch has been successfully completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Production completed successfully</span>
                  </div>
                  {batch.qualityScore && (
                    <p className="text-sm text-gray-600 mt-2">
                      Quality Score: {batch.qualityScore}/10
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
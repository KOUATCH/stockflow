"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Factory,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  MapPin,
  Package,
  Play,
  Pause,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Timer,
  ChefHat
} from 'lucide-react'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { CreateBatchDialog } from './CreateBatchDialog'
import { BatchDetailsDialog } from './BatchDetailsDialog'
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

interface Recipe {
  id: string
  name: string
  category: string
  status: string
  yields: number
  yieldUnit: string
  totalCost: number
  costPerUnit: number
  suggestedSellingPrice: number
}

interface ProductionBatchManagementProps {
  batches: ProductionBatch[]
  recipes: Recipe[]
  organizationId: string
  currentUserId: string
}

export function ProductionBatchManagement({
  batches,
  recipes,
  organizationId,
  currentUserId
}: ProductionBatchManagementProps) {
  const notifications = useNotifications()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = !searchTerm ||
      batch.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.recipe?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'ALL' || batch.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || batch.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  // Calculate summary stats
  const totalBatches = batches.length
  const activeBatches = batches.filter(b => ['PLANNED', 'IN_PROGRESS', 'QUALITY_CHECK'].includes(b.status)).length
  const completedBatches = batches.filter(b => b.status === 'COMPLETED').length
  const totalUnitsProduced = batches.reduce((sum, b) => sum + b.quantityProduced, 0)
  const averageYield = batches.length > 0 ?
    batches.reduce((sum, b) => sum + b.yieldPercentage, 0) / batches.length : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED': return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
      case 'IN_PROGRESS': return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
      case 'QUALITY_CHECK': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
      case 'COMPLETED': return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
      case 'CANCELLED': return 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
      case 'ON_HOLD': return 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
      case 'HIGH': return 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
      case 'MEDIUM': return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg'
      case 'LOW': return 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
      default: return 'bg-gradient-to-r from-slate-500 to-gray-500 text-white shadow-lg'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLANNED': return <Calendar className="h-4 w-4" />
      case 'IN_PROGRESS': return <Timer className="h-4 w-4" />
      case 'QUALITY_CHECK': return <Eye className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <AlertTriangle className="h-4 w-4" />
      case 'ON_HOLD': return <Pause className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleCreateBatch = () => {
    setIsCreateDialogOpen(true)
  }

  const handleViewBatch = (batch: ProductionBatch) => {
    setSelectedBatch(batch)
    setIsDetailsDialogOpen(true)
  }

  const handleBatchAction = async (action: string, batchId: string) => {
    notifications.info('Processing', `${action} batch...`)
    // Implementation for batch actions would go here
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Production Batch Management
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Monitor, manage, and optimize your production batches with real-time tracking
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-teal-50/90 to-cyan-50/90 dark:from-teal-900/30 dark:to-cyan-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-teal-800 dark:text-teal-200">Total Batches</CardTitle>
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                <Factory className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-900 dark:text-teal-100">{totalBatches}</div>
              <p className="text-sm text-teal-700 dark:text-teal-300 mt-1">All production batches</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50/90 to-orange-50/90 dark:from-amber-900/30 dark:to-orange-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-amber-800 dark:text-amber-200">Active Batches</CardTitle>
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                <Timer className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{activeBatches}</div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">In production</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-green-800 dark:text-green-200">Completed</CardTitle>
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{completedBatches}</div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Successfully finished</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50/90 to-pink-50/90 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-purple-800 dark:text-purple-200">Units Produced</CardTitle>
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{formatNumber(totalUnitsProduced)}</div>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Total output</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-cyan-50/90 to-blue-50/90 dark:from-cyan-900/30 dark:to-blue-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold text-cyan-800 dark:text-cyan-200">Average Yield</CardTitle>
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-900 dark:text-cyan-100">{formatPercentage(averageYield)}</div>
              <p className="text-sm text-cyan-700 dark:text-cyan-300 mt-1">Production efficiency</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-xl rounded-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Production Batches</CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300 mt-2">Manage and monitor your production batches with real-time tracking</CardDescription>
              </div>
              <Button onClick={handleCreateBatch} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Plus className="h-5 w-5 mr-2" />
                Create Batch
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-teal-600" />
                Filter & Search Batches
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">Search Batches</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search by batch number or recipe..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-teal-500/20 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">Batch Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-cyan-500 dark:focus:border-cyan-400 rounded-lg">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 rounded-lg">
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PLANNED">Planned</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="QUALITY_CHECK">Quality Check</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-medium mb-2 block">Priority Level</label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 rounded-lg">
                      <SelectItem value="ALL">All Priority</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Batches Table */}
            <div className="bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border border-slate-200/30 dark:border-slate-600/30 rounded-2xl overflow-hidden shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/50 dark:to-cyan-900/50 border-b border-teal-200/50 dark:border-teal-700/50">
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Batch Number</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Recipe</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Status</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Priority</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Quantity</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Yield</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Scheduled</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Cost</TableHead>
                    <TableHead className="font-bold text-teal-800 dark:text-teal-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                  {filteredBatches.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl">
                            <Factory className="h-12 w-12 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No production batches found</h3>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">Create your first batch to start tracking production</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBatches.map((batch) => (
                      <TableRow key={batch.id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200">
                      <TableCell className="font-mono font-medium">
                        {batch.batchNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.recipe?.name}</div>
                          <div className="text-sm text-gray-500">{batch.recipe?.category}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(batch.status)}>
                          {getStatusIcon(batch.status)}
                          <span className="ml-1">{batch.status.replace('_', ' ')}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPriorityColor(batch.priority)}>
                          {batch.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{batch.quantityProduced}/{batch.quantityPlanned}</div>
                          <div className="text-sm text-gray-500">{batch.recipe?.yieldUnit}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatPercentage(batch.yieldPercentage)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(batch.scheduledStartTime).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(batch.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(batch.totalCost)}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(batch.costPerUnit)}/unit</div>
                        </div>
                      </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewBatch(batch)}
                              className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border-teal-300/50 dark:border-teal-600/50 text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200 rounded-lg"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {batch.status === 'PLANNED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBatchAction('Start', batch.id)}
                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-300/50 dark:border-green-600/50 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200 rounded-lg"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {batch.status === 'IN_PROGRESS' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBatchAction('Complete', batch.id)}
                                className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border-blue-300/50 dark:border-blue-600/50 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-200 rounded-lg"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                  ))
                )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Batch Dialog */}
      <CreateBatchDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        recipes={recipes}
        organizationId={organizationId}
        currentUserId={currentUserId}
      />

      {/* Batch Details Dialog */}
      {selectedBatch && (
        <BatchDetailsDialog
          isOpen={isDetailsDialogOpen}
          onClose={() => setIsDetailsDialogOpen(false)}
          batch={selectedBatch}
          organizationId={organizationId}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
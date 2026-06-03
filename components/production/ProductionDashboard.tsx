"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Factory,
  TrendingUp,
  Clock,
  Package,
  DollarSign,
  AlertTriangle,
  Users,
  BarChart3,
  Plus,
  Eye,
  Play,
  CheckCircle,
  ChefHat
} from 'lucide-react'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { getProductionBatches, getProductionAnalytics } from '@/actions/production/productionSystemActions'
import { useRouter } from 'next/navigation'

interface ProductionDashboardProps {
  organizationId: string
  currentUserId: string
}

interface DashboardData {
  activeBatches: number
  totalUnitsProduced: number
  totalCosts: number
  efficiency: number
  recentBatches: any[]
  analytics: any
}

export function ProductionDashboard({ organizationId, currentUserId }: ProductionDashboardProps) {
  const notifications = useNotifications()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    activeBatches: 0,
    totalUnitsProduced: 0,
    totalCosts: 0,
    efficiency: 0,
    recentBatches: [],
    analytics: null
  })

  useEffect(() => {
    loadDashboardData()
  }, [organizationId])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      notifications.info('Loading', 'Fetching production data...')

      // Fetch production data from database
      const [batchesResult, analyticsResult] = await Promise.all([
        getProductionBatches(organizationId),
        getProductionAnalytics(organizationId)
      ])

      if (batchesResult.success && analyticsResult.success) {
        const batches = batchesResult.data || []
        const analytics = analyticsResult.data

        // Calculate dashboard metrics from real data
        const activeBatches = batches.filter(b =>
          ['PLANNED', 'IN_PROGRESS', 'QUALITY_CHECK'].includes(b.status)
        ).length

        const totalUnitsProduced = batches.reduce((sum, batch) =>
          sum + (batch.quantityProduced || 0), 0)

        const totalCosts = analytics?.totalCosts || 0
        const efficiency = analytics?.averageYieldPercentage || 0

        setDashboardData({
          activeBatches,
          totalUnitsProduced,
          totalCosts,
          efficiency,
          recentBatches: batches.slice(0, 5),
          analytics
        })

        notifications.success('Data Loaded', 'Production data loaded successfully')
      } else {
        // If no data exists yet, show welcome state
        notifications.warning('No Data', 'No production data found. Create your first recipe to get started!')
      }
    } catch (error) {
      console.error('Error loading production data:', error)
      notifications.error('Loading Error', 'Failed to load production data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFirstRecipe = () => {
    router.push('/dashboard/production/recipes')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-3xl mb-6">
            <Factory className="w-16 h-16 text-teal-600 dark:text-teal-400 animate-pulse mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Loading Production Data</h2>
          <p className="text-slate-600 dark:text-slate-400">Fetching real-time production analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent mb-2">Production Dashboard</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">Monitor and analyze your production operations in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-lg px-4 py-2 shadow-lg">
              <Factory className="h-5 w-5 mr-2" />
              Production System
            </Badge>
            <Button onClick={loadDashboardData} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

      {/* Key Metrics - Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Batches</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <Factory className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-1">
              {dashboardData.activeBatches}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Currently in production</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-blue-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Units Produced</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
              {dashboardData.totalUnitsProduced.toLocaleString()}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total production</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Production Costs</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
              ${dashboardData.totalCosts.toFixed(2)}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Total costs</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-green-500/10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300">Efficiency</CardTitle>
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-1">
              {dashboardData.efficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Average yield</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-1.5">
          <TabsTrigger value="overview" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
            Overview
          </TabsTrigger>
          <TabsTrigger value="recent" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
            Recent Batches
          </TabsTrigger>
          <TabsTrigger value="getting-started" className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-white/50 dark:hover:bg-slate-700/50">
            Getting Started
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {dashboardData.analytics ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    Production Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Batches:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{dashboardData.analytics.totalBatches}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Avg Quality Score:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">{dashboardData.analytics.averageQualityScore?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Capacity Utilization:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{dashboardData.analytics.capacityUtilization?.toFixed(1) || 'N/A'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10"></div>
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gross Profit:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">${dashboardData.analytics.grossProfit?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gross Margin:</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{dashboardData.analytics.grossMargin?.toFixed(1) || '0.0'}%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Revenue:</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400">${dashboardData.analytics.totalRevenue?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-emerald-500/10"></div>
                <CardHeader className="relative z-10 pb-3">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl shadow-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl">
                      <div className="relative">
                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Production system operational</span>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Data last updated: {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
              <CardHeader className="relative z-10 text-center">
                <div className="mx-auto mb-4 p-6 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-3xl w-fit shadow-lg">
                  <ChefHat className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome to Production System
                </CardTitle>
                <CardDescription className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                  Get started with your bakery production management
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-center font-medium">
                  No production data found yet. Create your first recipe to start tracking your bakery operations.
                </p>
                <Button onClick={handleCreateFirstRecipe} className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Recipe
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                Recent Production Batches
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-300 font-medium text-base">
                Latest production activity and batch status updates
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {dashboardData.recentBatches.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20">
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Batch #</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Recipe</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Status</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Quantity</TableHead>
                        <TableHead className="font-bold text-slate-700 dark:text-slate-300">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentBatches.map((batch) => (
                        <TableRow key={batch.id} className="border-b border-slate-200/30 dark:border-slate-700/30 hover:bg-gradient-to-r hover:from-teal-50/30 hover:to-cyan-50/30 dark:hover:from-teal-900/10 dark:hover:to-cyan-900/10 transition-all duration-300">
                          <TableCell className="font-mono font-semibold text-teal-600 dark:text-teal-400">{batch.batchNumber}</TableCell>
                          <TableCell className="font-medium text-slate-700 dark:text-slate-300">{batch.recipe?.name || 'Unknown Recipe'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 font-medium">
                              {batch.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-700 dark:text-slate-300">{batch.quantityPlanned}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{new Date(batch.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl w-fit">
                    <Package className="h-16 w-16 text-teal-600 dark:text-teal-400 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">No Production Batches</h3>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">No production batches have been created yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="getting-started" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-emerald-500/10 group-hover:from-teal-500/20 group-hover:via-cyan-500/10 group-hover:to-emerald-500/20 transition-all duration-500"></div>
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <ChefHat className="h-5 w-5 text-white" />
                  </div>
                  Recipe Management
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Start by creating recipes with ingredients, instructions, and cost calculations.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/production/recipes')}
                  className="w-full border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 dark:hover:from-teal-900/30 dark:hover:to-cyan-900/30 hover:border-teal-300 dark:hover:border-teal-600 font-semibold py-2.5 rounded-xl transition-all duration-300"
                >
                  Go to Recipes
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-teal-500/10 group-hover:from-cyan-500/20 group-hover:via-blue-500/10 group-hover:to-teal-500/20 transition-all duration-500"></div>
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Factory className="h-5 w-5 text-white" />
                  </div>
                  Production Batches
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Schedule and track production batches with real-time monitoring.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/production/batches')}
                  className="w-full border-cyan-200 dark:border-cyan-700 text-cyan-700 dark:text-cyan-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 dark:hover:from-cyan-900/30 dark:hover:to-blue-900/30 hover:border-cyan-300 dark:hover:border-cyan-600 font-semibold py-2.5 rounded-xl transition-all duration-300"
                >
                  View Batches
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 group-hover:from-emerald-500/20 group-hover:via-teal-500/10 group-hover:to-green-500/20 transition-all duration-500"></div>
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Analyze costs, profitability, and production efficiency.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/production/profitability')}
                  className="w-full border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/30 dark:hover:to-teal-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 font-semibold py-2.5 rounded-xl transition-all duration-300"
                >
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-cyan-500/10 group-hover:from-teal-500/20 group-hover:via-emerald-500/10 group-hover:to-cyan-500/20 transition-all duration-500"></div>
              <CardHeader className="relative z-10 pb-3">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  Inventory Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  Automatic inventory conversion from raw materials to finished products.
                </p>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/inventory/items')}
                  className="w-full border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 dark:hover:from-teal-900/30 dark:hover:to-emerald-900/30 hover:border-teal-300 dark:hover:border-teal-600 font-semibold py-2.5 rounded-xl transition-all duration-300"
                >
                  View Inventory
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
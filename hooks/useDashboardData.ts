"use client"

import { useState, useEffect, useCallback } from 'react'

interface DashboardMetrics {
  revenue: {
    current: number
    previous: number
    change: number
    target: number
  }
  orders: {
    current: number
    previous: number
    change: number
    target: number
  }
  customers: {
    current: number
    previous: number
    change: number
    target: number
  }
  inventory: {
    current: number
    previous: number
    change: number
    target: number
  }
  conversionRate: {
    current: number
    previous: number
    change: number
    target: number
  }
  avgOrderValue: {
    current: number
    previous: number
    change: number
    target: number
  }
}

interface SalesData {
  period: string
  revenue: number
  orders: number
  customers: number
  avgOrder: number
  conversionRate: number
}

interface ProductPerformance {
  id: string
  name: string
  category: string
  sales: number
  revenue: number
  trend: 'up' | 'down' | 'stable'
  stockLevel: number
  margin: number
}

interface LocationData {
  id: string
  name: string
  type: 'store' | 'warehouse' | 'online'
  revenue: number
  orders: number
  growth: number
  rating: number
  isActive: boolean
}

interface AlertData {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  title: string
  description: string
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
}

interface ActivityData {
  id: string
  type: 'order' | 'inventory' | 'payment' | 'customer' | 'return' | 'system'
  title: string
  description: string
  timestamp: Date
  status: 'success' | 'warning' | 'error' | 'info'
  userId?: string
  relatedId?: string
}

export function useDashboardData(refreshInterval: number = 30000) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<ProductPerformance[]>([])
  const [locations, setLocations] = useState<LocationData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Simulated API calls - replace with actual API endpoints
  const fetchMetrics = useCallback(async (): Promise<DashboardMetrics> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000))

    return {
      revenue: {
        current: 2847923 + Math.random() * 100000,
        previous: 2538291,
        change: 10 + Math.random() * 5,
        target: 3000000
      },
      orders: {
        current: 15234 + Math.floor(Math.random() * 1000),
        previous: 14012,
        change: 5 + Math.random() * 8,
        target: 16000
      },
      customers: {
        current: 8492 + Math.floor(Math.random() * 100),
        previous: 7891,
        change: 6 + Math.random() * 3,
        target: 9000
      },
      inventory: {
        current: 1923847 - Math.random() * 50000,
        previous: 2045291,
        change: -2 - Math.random() * 4,
        target: 2100000
      },
      conversionRate: {
        current: 3.2 + Math.random() * 0.5,
        previous: 2.8,
        change: 10 + Math.random() * 8,
        target: 3.5
      },
      avgOrderValue: {
        current: 187.50 + Math.random() * 20,
        previous: 181.23,
        change: 2 + Math.random() * 4,
        target: 200.00
      }
    }
  }, [])

  const fetchSalesData = useCallback(async (): Promise<SalesData[]> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800))

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(month => ({
      period: month,
      revenue: 125000 + Math.random() * 180000,
      orders: 1240 + Math.random() * 1650,
      customers: 890 + Math.random() * 1190,
      avgOrder: 101 + Math.random() * 8,
      conversionRate: 2.8 + Math.random() * 1.2
    }))
  }, [])

  const fetchTopProducts = useCallback(async (): Promise<ProductPerformance[]> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 600))

    const products = [
      { name: 'iPhone 15 Pro Max', category: 'Electronics' },
      { name: 'Samsung Galaxy S24 Ultra', category: 'Electronics' },
      { name: 'MacBook Pro M3', category: 'Electronics' },
      { name: 'Nike Air Max 270', category: 'Clothing' },
      { name: 'Dyson V15 Detect', category: 'Home & Garden' },
      { name: 'Sony WH-1000XM5', category: 'Electronics' },
      { name: 'Adidas Ultraboost 22', category: 'Clothing' },
      { name: 'KitchenAid Stand Mixer', category: 'Home & Garden' }
    ]

    return products.map((product, index) => ({
      id: `prod-${index + 1}`,
      name: product.name,
      category: product.category,
      sales: Math.floor(456 + Math.random() * 2000),
      revenue: Math.floor(140000 + Math.random() * 1800000),
      trend: Math.random() > 0.3 ? 'up' : Math.random() > 0.6 ? 'down' : 'stable',
      stockLevel: Math.floor(10 + Math.random() * 500),
      margin: Math.floor(20 + Math.random() * 40)
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  }, [])

  const fetchLocations = useCallback(async (): Promise<LocationData[]> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 700))

    return [
      {
        id: 'loc-1',
        name: 'Store #001 - Downtown',
        type: 'store',
        revenue: 485000 + Math.random() * 100000,
        orders: 2840 + Math.random() * 500,
        growth: 8 + Math.random() * 8,
        rating: 4.6 + Math.random() * 0.4,
        isActive: true
      },
      {
        id: 'loc-2',
        name: 'Store #002 - Mall Central',
        type: 'store',
        revenue: 423000 + Math.random() * 80000,
        orders: 2156 + Math.random() * 400,
        growth: 4 + Math.random() * 8,
        rating: 4.4 + Math.random() * 0.4,
        isActive: true
      },
      {
        id: 'loc-3',
        name: 'Store #003 - Westside',
        type: 'store',
        revenue: 367000 + Math.random() * 60000,
        orders: 1892 + Math.random() * 300,
        growth: -1 + Math.random() * 6,
        rating: 4.2 + Math.random() * 0.4,
        isActive: true
      },
      {
        id: 'loc-4',
        name: 'Warehouse North',
        type: 'warehouse',
        revenue: 0,
        orders: 0,
        growth: 0,
        rating: 0,
        isActive: true
      },
      {
        id: 'loc-5',
        name: 'Online Store',
        type: 'online',
        revenue: 892000 + Math.random() * 200000,
        orders: 5240 + Math.random() * 1000,
        growth: 15 + Math.random() * 10,
        rating: 4.7 + Math.random() * 0.3,
        isActive: true
      }
    ]
  }, [])

  const fetchAlerts = useCallback(async (): Promise<AlertData[]> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500))

    const alertTypes = ['critical', 'warning', 'info', 'success'] as const
    const alerts = [
      {
        type: 'warning' as const,
        title: 'Low Stock Alert',
        description: 'iPhone 15 Pro Max - Only 5 units remaining'
      },
      {
        type: 'critical' as const,
        title: 'System Maintenance',
        description: 'Scheduled maintenance tonight 2:00-4:00 AM'
      },
      {
        type: 'info' as const,
        title: 'New Feature Available',
        description: 'Advanced analytics dashboard is now ready'
      },
      {
        type: 'success' as const,
        title: 'Backup Completed',
        description: 'Daily database backup completed successfully'
      },
      {
        type: 'warning' as const,
        title: 'Payment Gateway',
        description: 'Stripe connection experiencing delays'
      }
    ]

    return alerts.map((alert, index) => ({
      id: `alert-${index + 1}`,
      type: alert.type,
      title: alert.title,
      description: alert.description,
      timestamp: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      isRead: Math.random() > 0.7,
      actionRequired: alert.type === 'critical' || (alert.type === 'warning' && Math.random() > 0.5)
    }))
  }, [])

  const fetchActivities = useCallback(async (): Promise<ActivityData[]> => {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400))

    const activityTypes = ['order', 'inventory', 'payment', 'customer', 'return', 'system'] as const
    const activities = [
      {
        type: 'order' as const,
        title: 'New Order Created',
        description: 'Order #ORD-15847 by John Smith - $1,249.99'
      },
      {
        type: 'inventory' as const,
        title: 'Stock Adjustment',
        description: 'Samsung Galaxy S24 - Quantity updated to 45 units'
      },
      {
        type: 'payment' as const,
        title: 'Payment Processed',
        description: 'Order #ORD-15845 - $892.50 via Stripe'
      },
      {
        type: 'customer' as const,
        title: 'New Customer Registration',
        description: 'Sarah Johnson created account'
      },
      {
        type: 'return' as const,
        title: 'Return Initiated',
        description: 'Order #ORD-15823 - MacBook Pro M3'
      },
      {
        type: 'system' as const,
        title: 'Database Backup',
        description: 'Scheduled backup completed successfully'
      }
    ]

    return activities.map((activity, index) => ({
      id: `activity-${index + 1}`,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: new Date(Date.now() - index * 3600000), // Hourly intervals
      status: Math.random() > 0.8 ? 'warning' : Math.random() > 0.9 ? 'error' : 'success',
      userId: `user-${Math.floor(Math.random() * 10) + 1}`,
      relatedId: activity.type === 'order' ? `order-${Math.floor(Math.random() * 1000)}` : undefined
    }))
  }, [])

  const refreshData = useCallback(async () => {
    try {
      setError(null)
      setIsLoading(true)

      const [
        metricsData,
        salesData,
        productsData,
        locationsData,
        alertsData,
        activitiesData
      ] = await Promise.all([
        fetchMetrics(),
        fetchSalesData(),
        fetchTopProducts(),
        fetchLocations(),
        fetchAlerts(),
        fetchActivities()
      ])

      setMetrics(metricsData)
      setSalesData(salesData)
      setTopProducts(productsData)
      setLocations(locationsData)
      setAlerts(alertsData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
      setActivities(activitiesData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()))
      setLastUpdated(new Date())

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchMetrics, fetchSalesData, fetchTopProducts, fetchLocations, fetchAlerts, fetchActivities])

  // Initial data load
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Auto-refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(refreshData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [refreshData, refreshInterval])

  // Mark alert as read
  const markAlertAsRead = useCallback((alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    )
  }, [])

  // Dismiss alert
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  return {
    // Data
    metrics,
    salesData,
    topProducts,
    locations,
    alerts,
    activities,

    // State
    isLoading,
    error,
    lastUpdated,

    // Actions
    refreshData,
    markAlertAsRead,
    dismissAlert,

    // Computed values
    unreadAlerts: alerts.filter(alert => !alert.isRead).length,
    criticalAlerts: alerts.filter(alert => alert.type === 'critical').length,
    totalRevenue: metrics?.revenue.current || 0,
    totalOrders: metrics?.orders.current || 0,

    // Real-time indicators
    isDataStale: lastUpdated ? Date.now() - lastUpdated.getTime() > refreshInterval * 2 : false
  }
}

export default useDashboardData
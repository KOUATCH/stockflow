"use client"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import useDashboardData from "@/hooks/useDashboardData"
import type {
  DashboardAlert,
  DashboardData,
  DashboardMetric,
  DashboardPeriod,
} from "@/actions/dashboard/getDashboardData"
import { cn } from "@/lib/utils"
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  ExternalLink,
  Package,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
import type { ComponentType } from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

export interface EnterpriseDashboardLabels {
  title: string
  subtitle: string
  connected: string
  generated: string
  refresh: string
  refreshing: string
  refreshStarted: string
  refreshStartedMessage: string
  refreshSuccess: string
  refreshSuccessMessage: string
  refreshError: string
  allLocations: string
  filters: {
    period: string
    location: string
  }
  periods: Record<DashboardPeriod, string>
  tabs: {
    overview: string
    inventory: string
    operations: string
  }
  metrics: {
    revenue: string
    orders: string
    customers: string
    inventoryValue: string
    averageOrderValue: string
    cashCollected: string
  }
  metricDescriptions: {
    revenue: string
    orders: string
    customers: string
    inventoryValue: string
    averageOrderValue: string
    cashCollected: string
  }
  sections: {
    salesTrend: string
    salesTrendDescription: string
    topProducts: string
    topProductsDescription: string
    pendingActions: string
    stockHealth: string
    stockHealthDescription: string
    locationPerformance: string
    locationPerformanceDescription: string
    alerts: string
    alertsDescription: string
    recentActivity: string
    recentActivityDescription: string
    quickActions: string
    quickActionsDescription: string
  }
  stock: {
    trackedItems: string
    inStock: string
    lowStock: string
    outOfStock: string
    overstock: string
    reorderCandidates: string
    availableUnits: string
    reservedUnits: string
  }
  empty: {
    topProducts: string
    alerts: string
    activity: string
    locations: string
  }
  actions: {
    view: string
    open: string
    inventory: string
    sales: string
    purchases: string
    finance: string
  }
  comparison: string
}

export const defaultEnterpriseDashboardLabels: EnterpriseDashboardLabels = {
  title: "Operations dashboard",
  subtitle: "A real-time overview of sales, stock, purchasing, and branch health.",
  connected: "Live data",
  generated: "Updated",
  refresh: "Refresh",
  refreshing: "Refreshing",
  refreshStarted: "Dashboard refresh started",
  refreshStartedMessage: "Fetching the latest operating data.",
  refreshSuccess: "Dashboard refreshed",
  refreshSuccessMessage: "The latest dashboard data is now visible.",
  refreshError: "Dashboard refresh failed",
  allLocations: "All locations",
  filters: {
    period: "Period",
    location: "Location",
  },
  periods: {
    "7d": "Last 7 days",
    "30d": "Last 30 days",
    "90d": "Last 90 days",
    mtd: "Month to date",
  },
  tabs: {
    overview: "Overview",
    inventory: "Inventory",
    operations: "Operations",
  },
  metrics: {
    revenue: "Revenue",
    orders: "Orders",
    customers: "Customers",
    inventoryValue: "Inventory value",
    averageOrderValue: "Avg. order value",
    cashCollected: "Cash collected",
  },
  metricDescriptions: {
    revenue: "Completed sales in the selected period",
    orders: "Completed and delivered sales orders",
    customers: "Customers in this organization",
    inventoryValue: "Current value of tracked stock",
    averageOrderValue: "Revenue divided by completed orders",
    cashCollected: "Paid customer payments in the period",
  },
  sections: {
    salesTrend: "Sales trend",
    salesTrendDescription: "Daily revenue and completed order movement.",
    topProducts: "Top products",
    topProductsDescription: "Best revenue contributors in the selected period.",
    pendingActions: "Pending actions",
    stockHealth: "Inventory health",
    stockHealthDescription: "Tracked stock posture across the selected scope.",
    locationPerformance: "Location performance",
    locationPerformanceDescription: "Revenue, orders, and stock value by branch.",
    alerts: "Operating alerts",
    alertsDescription: "Important issues that need attention.",
    recentActivity: "Recent activity",
    recentActivityDescription: "Latest sales, purchase, and stock movements.",
    quickActions: "Quick actions",
    quickActionsDescription: "Move from insight to the operational surface.",
  },
  stock: {
    trackedItems: "Tracked items",
    inStock: "Healthy",
    lowStock: "Low stock",
    outOfStock: "Out of stock",
    overstock: "Overstock",
    reorderCandidates: "Reorder candidates",
    availableUnits: "Available units",
    reservedUnits: "Reserved units",
  },
  empty: {
    topProducts: "No product sales were found for this period.",
    alerts: "No urgent operating alerts right now.",
    activity: "No recent activity was found for this period.",
    locations: "No active locations were found.",
  },
  actions: {
    view: "View",
    open: "Open",
    inventory: "Inventory",
    sales: "Sales",
    purchases: "Purchases",
    finance: "Finance",
  },
  comparison: "vs previous period",
}

interface EnhancedEnterpriseDashboardProps {
  organizationId: string
  dashboardData: DashboardData
  labels?: EnterpriseDashboardLabels
  locale?: string
  dashboardBasePath?: string
  className?: string
}

const periodOptions: DashboardPeriod[] = ["7d", "30d", "90d", "mtd"]

function getTrend(metric: DashboardMetric) {
  if (metric.change > 0) return "up"
  if (metric.change < 0) return "down"
  return "flat"
}

function formatChange(value: number, locale: string) {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })

  return `${value > 0 ? "+" : ""}${formatter.format(value)}%`
}

function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCurrency(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "XAF" ? 0 : 2,
  }).format(value)
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function resolveDashboardHref(href: string | undefined, dashboardBasePath: string) {
  if (!href) return dashboardBasePath
  if (href === "/dashboard") return dashboardBasePath
  if (href.startsWith("/dashboard/")) {
    return `${dashboardBasePath}${href.slice("/dashboard".length)}`
  }
  return href
}

function alertClasses(type: DashboardAlert["type"]) {
  switch (type) {
    case "critical":
      return "border-red-200 bg-red-50 text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100"
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-100"
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-100"
    default:
      return "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-100"
  }
}

function MetricCard({
  title,
  description,
  value,
  metric,
  icon: Icon,
  locale,
  labels,
  accent,
}: {
  title: string
  description: string
  value: string
  metric: DashboardMetric
  icon: ComponentType<{ className?: string }>
  locale: string
  labels: EnterpriseDashboardLabels
  accent: string
}) {
  const trend = getTrend(metric)
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Activity
  const trendClass =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-muted-foreground"

  return (
    <Card className="overflow-hidden border-border/70 bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="truncate text-2xl font-semibold tracking-tight text-foreground">{value}</p>
          </div>
          <div className={cn("rounded-lg p-2.5", accent)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span className={cn("inline-flex items-center gap-1 font-medium", trendClass)}>
            <TrendIcon className="h-3.5 w-3.5" />
            {formatChange(metric.change, locale)}
          </span>
          <span className="text-muted-foreground">{labels.comparison}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function LoadingDashboard() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export default function EnhancedEnterpriseDashboard({
  organizationId,
  dashboardData,
  labels = defaultEnterpriseDashboardLabels,
  locale = "en",
  dashboardBasePath = "/dashboard",
  className,
}: EnhancedEnterpriseDashboardProps) {
  const [period, setPeriod] = useState<DashboardPeriod>(dashboardData.period.key)
  const [locationId, setLocationId] = useState<string>("all")
  const notifications = useNotifications()
  const locationOptions = dashboardData.locations

  const filters = useMemo(
    () => ({
      period,
      locationId: locationId === "all" ? undefined : locationId,
    }),
    [period, locationId]
  )
  const shouldUseInitialData = period === dashboardData.period.key && locationId === "all"

  const {
    data,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useDashboardData(organizationId, filters, shouldUseInitialData ? dashboardData : undefined)

  const dashboard = data || dashboardData
  const currency = dashboard.organization.currency || "XAF"

  const kpis = [
    {
      title: labels.metrics.revenue,
      description: labels.metricDescriptions.revenue,
      value: formatCurrency(dashboard.kpis.revenue.current, currency, locale),
      metric: dashboard.kpis.revenue,
      icon: DollarSign,
      accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      title: labels.metrics.orders,
      description: labels.metricDescriptions.orders,
      value: formatNumber(dashboard.kpis.orders.current, locale),
      metric: dashboard.kpis.orders,
      icon: ShoppingCart,
      accent: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    },
    {
      title: labels.metrics.customers,
      description: labels.metricDescriptions.customers,
      value: formatNumber(dashboard.kpis.customers.current, locale),
      metric: dashboard.kpis.customers,
      icon: Users,
      accent: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    },
    {
      title: labels.metrics.inventoryValue,
      description: labels.metricDescriptions.inventoryValue,
      value: formatCurrency(dashboard.kpis.inventoryValue.current, currency, locale),
      metric: dashboard.kpis.inventoryValue,
      icon: Package,
      accent: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      title: labels.metrics.averageOrderValue,
      description: labels.metricDescriptions.averageOrderValue,
      value: formatCurrency(dashboard.kpis.averageOrderValue.current, currency, locale),
      metric: dashboard.kpis.averageOrderValue,
      icon: TrendingUp,
      accent: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    },
    {
      title: labels.metrics.cashCollected,
      description: labels.metricDescriptions.cashCollected,
      value: formatCurrency(dashboard.kpis.cashCollected.current, currency, locale),
      metric: dashboard.kpis.cashCollected,
      icon: CreditCard,
      accent: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
    },
  ]

  const criticalAlert = dashboard.alerts.find((alert) => alert.type === "critical")
  const stockTotal = Math.max(dashboard.stockHealth.trackedItems, 1)

  async function handleRefresh() {
    notifications.info(labels.refreshStarted, labels.refreshStartedMessage, {
      category: "operation",
      duration: 2500,
    })

    const result = await refetch()

    if (result.error) {
      notifications.error(labels.refreshError, result.error.message, {
        category: "operation",
      })
      return
    }

    notifications.success(labels.refreshSuccess, labels.refreshSuccessMessage, {
      category: "operation",
    })
  }

  if (isLoading && !dashboard) {
    return <LoadingDashboard />
  }

  return (
    <div className={cn("min-h-screen bg-background text-foreground", className)}>
      <div className="space-y-6 p-4 sm:p-6">
        <section className="rounded-none border-b border-border/70 bg-background pb-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                  {labels.connected}
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <Clock3 className="h-3.5 w-3.5" />
                  {labels.generated}: {formatDateTime(dashboard.generatedAt, locale)}
                </Badge>
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {labels.title}
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
                  {labels.subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{labels.filters.period}</p>
                  <Select value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
                    <SelectTrigger className="w-full sm:w-[170px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {labels.periods[option]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{labels.filters.location}</p>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger className="w-full sm:w-[210px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{labels.allLocations}</SelectItem>
                      {locationOptions.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleRefresh} disabled={isFetching} className="sm:self-end">
                <RefreshCw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
                {isFetching ? labels.refreshing : labels.refresh}
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <Alert className="border-red-200 bg-red-50 text-red-950 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{labels.refreshError}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        {criticalAlert && (
          <Alert className={alertClasses(criticalAlert.type)}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{criticalAlert.title}</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{criticalAlert.description}</span>
              {criticalAlert.href && (
                <Button asChild size="sm" variant="outline">
                  <Link href={resolveDashboardHref(criticalAlert.href, dashboardBasePath)}>
                    {labels.actions.view}
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {kpis.map((kpi) => (
            <MetricCard key={kpi.title} {...kpi} locale={locale} labels={labels} />
          ))}
        </section>

        <Tabs defaultValue="overview" className="space-y-5">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 md:w-[520px]">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="truncate">{labels.tabs.overview}</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Boxes className="h-4 w-4" />
              <span className="truncate">{labels.tabs.inventory}</span>
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Activity className="h-4 w-4" />
              <span className="truncate">{labels.tabs.operations}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.salesTrend}</CardTitle>
                  <CardDescription>{labels.sections.salesTrendDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[330px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboard.salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                        <YAxis tickLine={false} axisLine={false} fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            background: "hsl(var(--popover))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: 8,
                            color: "hsl(var(--popover-foreground))",
                          }}
                          formatter={(value, name) => {
                            if (name === "revenue") return [formatCurrency(Number(value), currency, locale), labels.metrics.revenue]
                            return [formatNumber(Number(value), locale), labels.metrics.orders]
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#059669"
                          fill="#059669"
                          fillOpacity={0.18}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="orders"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.12}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.topProducts}</CardTitle>
                  <CardDescription>{labels.sections.topProductsDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.topProducts.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      {labels.empty.topProducts}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {dashboard.topProducts.map((product, index) => (
                        <Link
                          key={product.id}
                          href={resolveDashboardHref(product.href, dashboardBasePath)}
                          className="group flex items-center gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/60"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{product.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {product.sku} · {product.category}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatCurrency(product.revenue, currency, locale)}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatNumber(product.quantitySold, locale)} sold
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{labels.sections.pendingActions}</CardTitle>
                <CardDescription>{labels.sections.quickActionsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  {dashboard.pendingActions.map((action) => (
                    <Link
                      key={action.id}
                      href={resolveDashboardHref(action.href, dashboardBasePath)}
                      className="rounded-lg border border-border/70 p-4 transition-colors hover:bg-muted/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{action.label}</p>
                          <p className="mt-2 text-3xl font-semibold">{formatNumber(action.count, locale)}</p>
                        </div>
                        <Badge
                          variant={action.severity === "critical" ? "destructive" : "secondary"}
                          className="capitalize"
                        >
                          {action.severity}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.stockHealth}</CardTitle>
                  <CardDescription>{labels.sections.stockHealthDescription}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      [labels.stock.trackedItems, dashboard.stockHealth.trackedItems],
                      [labels.stock.inStock, dashboard.stockHealth.inStock],
                      [labels.stock.lowStock, dashboard.stockHealth.lowStock],
                      [labels.stock.outOfStock, dashboard.stockHealth.outOfStock],
                      [labels.stock.overstock, dashboard.stockHealth.overstock],
                      [labels.stock.reorderCandidates, dashboard.stockHealth.reorderCandidates],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-border/70 p-3">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="mt-1 text-xl font-semibold">{formatNumber(Number(value), locale)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{labels.stock.inStock}</span>
                      <span>{formatNumber(dashboard.stockHealth.inStock, locale)}</span>
                    </div>
                    <Progress value={(dashboard.stockHealth.inStock / stockTotal) * 100} className="h-2" />
                    <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>
                        {labels.stock.availableUnits}: {formatNumber(dashboard.stockHealth.availableUnits, locale)}
                      </span>
                      <span>
                        {labels.stock.reservedUnits}: {formatNumber(dashboard.stockHealth.reservedUnits, locale)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.locationPerformance}</CardTitle>
                  <CardDescription>{labels.sections.locationPerformanceDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.locations.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      {labels.empty.locations}
                    </p>
                  ) : (
                    <div className="h-[360px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboard.locations}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                          <YAxis tickLine={false} axisLine={false} fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              color: "hsl(var(--popover-foreground))",
                            }}
                            formatter={(value, name) => {
                              if (name === "revenue") return [formatCurrency(Number(value), currency, locale), labels.metrics.revenue]
                              if (name === "inventoryValue") return [formatCurrency(Number(value), currency, locale), labels.metrics.inventoryValue]
                              return [formatNumber(Number(value), locale), labels.metrics.orders]
                            }}
                          />
                          <Bar dataKey="revenue" fill="#0f766e" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="inventoryValue" fill="#d97706" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operations" className="space-y-5">
            <div className="grid gap-5 xl:grid-cols-2">
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.alerts}</CardTitle>
                  <CardDescription>{labels.sections.alertsDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.alerts.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      {labels.empty.alerts}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboard.alerts.map((alert) => (
                        <Link
                          key={alert.id}
                          href={resolveDashboardHref(alert.href, dashboardBasePath)}
                          className={cn("block rounded-lg border p-4 transition-opacity hover:opacity-90", alertClasses(alert.type))}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium">{alert.title}</p>
                              <p className="mt-1 text-sm opacity-85">{alert.description}</p>
                            </div>
                            <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle>{labels.sections.recentActivity}</CardTitle>
                  <CardDescription>{labels.sections.recentActivityDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.activities.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      {labels.empty.activity}
                    </p>
                  ) : (
                    <ScrollArea className="h-[360px] pr-3">
                      <div className="space-y-3">
                        {dashboard.activities.map((activity) => {
                          const Icon =
                            activity.type === "sale"
                              ? ShoppingCart
                              : activity.type === "purchase"
                                ? Building2
                                : Package

                          return (
                            <Link
                              key={activity.id}
                              href={resolveDashboardHref(activity.href, dashboardBasePath)}
                              className="flex gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:bg-muted/60"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium capitalize">{activity.title}</p>
                                <p className="line-clamp-2 text-xs text-muted-foreground">{activity.description}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  {formatDateTime(activity.timestamp, locale)}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>{labels.sections.quickActions}</CardTitle>
                <CardDescription>{labels.sections.quickActionsDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: labels.actions.inventory, href: "/dashboard/inventory", icon: Package },
                    { label: labels.actions.sales, href: "/dashboard/sales", icon: ShoppingCart },
                    { label: labels.actions.purchases, href: "/dashboard/purchases", icon: Building2 },
                    { label: labels.actions.finance, href: "/dashboard/finance", icon: CreditCard },
                  ].map((action) => (
                    <Button key={action.href} asChild variant="outline" className="h-12 justify-between">
                      <Link href={resolveDashboardHref(action.href, dashboardBasePath)}>
                        <span className="inline-flex items-center gap-2">
                          <action.icon className="h-4 w-4" />
                          {action.label}
                        </span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

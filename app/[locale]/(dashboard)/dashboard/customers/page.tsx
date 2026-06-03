"use client"

import { CustomerTableWithFilters } from "@/components/customers/CustomersTableWithFilters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableLoading } from "@/components/ui/data-table"
import { useCustomers } from "@/hooks/useCustomerQueries"
import { useFormatters } from "@/hooks/useFormatters"
import { useTranslations } from "next-intl"
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Percent,
  Plus,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users
} from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Suspense } from "react"

export default function CustomersPage() {
  const t = useTranslations("customers")
  const customers = useCustomers()
  const customersData = customers?.data || []
  const fmt = useFormatters("USD")

  // Calculate customer statistics
  const totalRevenue = customersData.reduce((total: number, customer: any) => {
    const revenue = Number(customer?.totalOrderValue) || 0
    return total + (isNaN(revenue) ? 0 : revenue)
  }, 0)

  const activeCustomers = customersData.filter((customer: any) => customer?.isActive === true)
  const recentCustomers = customersData.filter((customer: any) => {
    const createdDate = new Date(customer?.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdDate >= thirtyDaysAgo
  })
  const vipCustomers = customersData.filter((customer: any) =>
    (Number(customer?.totalOrderValue) || 0) > 10000
  )

  // Calculate growth metrics
  const currentMonthCustomers = customersData.filter((customer: any) => {
    const createdDate = new Date(customer?.createdAt)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  })

  const lastMonthCustomers = customersData.filter((customer: any) => {
    const createdDate = new Date(customer?.createdAt)
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
    return createdDate.getMonth() === lastMonth.getMonth() && createdDate.getFullYear() === lastMonth.getFullYear()
  })

  const customerGrowthRate = lastMonthCustomers.length > 0
    ? ((currentMonthCustomers.length - lastMonthCustomers.length) / lastMonthCustomers.length) * 100
    : 0

  const averageOrderValue = customersData.length > 0 ? totalRevenue / customersData.length : 0
  const retentionRate = activeCustomers.length > 0 ? (activeCustomers.length / customersData.length) * 100 : 0

  const formatCurrency = (amount: number) => fmt.currency(amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  {t("page.title")}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {t("page.subtitle")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <FileText className="w-4 h-4 me-2" />
                {t("page.export")}
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Link href="/dashboard/customers/new">
                  <Plus className="w-4 h-4 sm:me-2" />
                  <span className="hidden sm:inline">{t("page.addCustomer")}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-400/20 dark:to-indigo-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.totalCustomers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{fmt.number(customersData.length)}</div>
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.totalCustomersHint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-400/20 dark:to-green-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.activeCustomers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{fmt.number(activeCustomers.length)}</div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.activeCustomersHint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.newThisMonth")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{fmt.number(recentCustomers.length)}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.newThisMonthHint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 dark:from-purple-400/20 dark:to-violet-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <Star className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.vipCustomers")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{fmt.number(vipCustomers.length)}</div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-purple-500 fill-purple-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.vipCustomersHint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
              <DollarSign className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.totalRevenue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{formatCurrency(totalRevenue)}</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-rose-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.totalRevenueHint")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10 dark:from-cyan-400/20 dark:to-teal-400/20"></div>
            <div className="absolute top-3 end-3 p-2 rounded-full bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
              <BarChart3 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {t("stats.avgOrderValue")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {formatCurrency(customersData.length > 0 ? totalRevenue / customersData.length : 0)}
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3 text-cyan-500" />
                <p className="text-xs text-slate-600 dark:text-slate-400">{t("stats.avgOrderValueHint")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Customer Growth Trend */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {t("analytics.growthTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {fmt.number(currentMonthCustomers.length)}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t("analytics.newCustomersLabel")}</p>
                </div>
                <div className="flex items-center gap-1">
                  {customerGrowthRate >= 0 ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm font-semibold ${customerGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {Math.abs(customerGrowthRate).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentMonthCustomers.length / Math.max(lastMonthCustomers.length, 1)) * 100, 100)}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Retention */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                {t("analytics.retentionTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {retentionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{t("analytics.retentionHint")}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Percent className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-semibold text-green-600">
                    {activeCustomers.length}/{customersData.length}
                  </span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${retentionRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Insights */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                {t("analytics.revenueTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-600 dark:text-slate-400">{t("analytics.vipShare")}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {((vipCustomers.length / Math.max(customersData.length, 1)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full transition-all duration-500"
                    style={{ width: `${(vipCustomers.length / Math.max(customersData.length, 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-600 dark:text-slate-400">{t("analytics.avgValueLabel")}</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(averageOrderValue)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Customer Management */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t("database.title")}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span>{t("database.customersCount", { n: customersData.length })}</span>
                    <span>•</span>
                    <span>{t("database.activeCount", { n: activeCustomers.length })}</span>
                    <span>•</span>
                    <span>{t("database.totalValue", { amount: formatCurrency(totalRevenue) })}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {t("database.growthThisMonth", { sign: customerGrowthRate >= 0 ? "+" : "", pct: customerGrowthRate.toFixed(1) })}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700"
              >
                <Activity className="w-3 h-3 me-1" />
                {t("database.liveData")}
              </Badge>
            </div>
          </div>

          <Suspense fallback={
            <div className="p-4 sm:p-8">
              <TableLoading title={t("database.loading")} />
            </div>
          }>
            <div className="p-4 sm:p-6">
              <CustomerTableWithFilters customers={customersData} />
            </div>
          </Suspense>
        </Card>
      </div>
    </div>
  )
}

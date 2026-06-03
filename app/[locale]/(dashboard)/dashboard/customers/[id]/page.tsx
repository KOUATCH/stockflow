"use client"

import { CustomerQuickActions } from "@/components/customers/CustomerQuickActions"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useCustomer, useCustomerOrders } from "@/hooks/useCustomerQueries"
import { useFormatters } from "@/hooks/useFormatters"
import { formatDistanceToNow } from "date-fns"
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Building,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Edit,
  Eye,
  FileText,
  Hash,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Users
} from "lucide-react"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import Link from "next/link"
import { useParams, usePathname, useRouter } from "next/navigation"

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const customerId = params.id as string

  const { data: customer, isLoading, error } = useCustomer(customerId)
  const { data: customerOrdersData, isLoading: ordersLoading } = useCustomerOrders(customerId)
  const { info, warning, success } = useNotifications()
  const fmt = useFormatters("USD")

  if (isLoading) {
    return <CustomerProfileSkeleton />
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Customer Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The customer you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push(localizedHref("/dashboard/customers"))} variant="outline">
              <ArrowLeft className="me-2 h-4 w-4" />
              Back to Customers
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isVip = false // TODO: Add VIP logic based on revenue/orders
  const recentCustomer = (() => {
    const createdDate = new Date(customer.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return createdDate >= thirtyDaysAgo
  })()

  const avatarFallback = customer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const formatCurrency = (amount: number) => fmt.currency(amount)

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(localizedHref("/dashboard/customers"))}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
                >
                  <ArrowLeft className="h-4 w-4 me-2" />
                  Back
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      Customer Profile
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Detailed customer information and activity
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    info("Export Started", `Exporting ${customer.name}'s profile data`)
                    // Add actual export logic here
                    setTimeout(() => success("Export Complete", "Customer profile exported successfully"), 2000)
                  }}
                >
                  <Download className="w-4 h-4 me-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => {
                    if (customer.email) {
                      info("Contact", `Opening email client for ${customer.email}`)
                      window.open(`mailto:${customer.email}`)
                    } else {
                      warning("No Email", "This customer doesn't have an email address on file")
                    }
                  }}
                >
                  <MessageCircle className="w-4 h-4 me-2" />
                  Contact
                </Button>
                <Link href={localizedHref(`/dashboard/customers/${customer.id}/edit`)}>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                    <Edit className="w-4 h-4 sm:me-2" />
                    <span className="hidden sm:inline">Edit Customer</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Info Card */}
            <div className="lg:col-span-1 space-y-6">
              <CustomerQuickActions
                customer={{
                  id: customer.id,
                  name: customer.name,
                  email: customer.email ?? undefined,
                  phone: customer.phone ?? undefined,
                  isActive: customer.isActive,
                  totalOrders: customerOrdersData?.stats?.totalOrders || 0
                }}
                currentPage="profile"
              />

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-6 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-slate-700 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
                        {avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                          {customer.name}
                        </h2>
                        {isVip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>VIP Customer</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {recentCustomer && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            New
                          </Badge>
                        )}
                      </div>
                      {customer.code && (
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                          #{customer.code}
                        </div>
                      )}
                      <Badge
                        variant={customer.isActive ? "default" : "secondary"}
                        className={
                          customer.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        }
                      >
                        <div className={`w-2 h-2 rounded-full me-2 ${customer.isActive ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                        {customer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </h3>

                    {customer.email && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                          <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Email</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                          <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Phone</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {customer.phone}
                          </div>
                        </div>
                      </div>
                    )}

                    {customer.address && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 mt-1">
                          <MapPin className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Address</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {customer.address}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-slate-200 dark:bg-slate-700" />

                  {/* Business Information */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Details
                    </h3>

                    {customer.taxId && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                          <Hash className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Tax ID</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {customer.taxId}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                      <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                        <Clock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Payment Terms</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {customer.paymentTerms} days
                        </div>
                      </div>
                    </div>

                    {customer.creditLimit && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                        <div className="p-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                          <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-500 dark:text-slate-400">Credit Limit</div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {formatCurrency(customer.creditLimit)}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                      <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900/30">
                        <Calendar className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-500 dark:text-slate-400">Joined</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatDistanceToNow(customer.createdAt, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {customer.notes && (
                    <>
                      <Separator className="bg-slate-200 dark:bg-slate-700" />
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Notes
                        </h3>
                        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-lg">
                          {customer.notes}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="orders" className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Orders
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                              Total Orders
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{customerOrdersData?.stats?.totalOrders || 0}</p>
                          </div>
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                              Total Spent
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">${customerOrdersData?.stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                              Avg Order
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">${customerOrdersData?.stats?.averageOrderValue?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                              Last Order
                            </p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {customerOrdersData?.orders?.[0]
                                ? formatDistanceToNow(customerOrdersData.orders[0].createdAt, { addSuffix: true })
                                : '-'
                              }
                            </p>
                          </div>
                          <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity Card */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/60 dark:border-slate-700/60">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Recent Activity
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Customer interaction history and milestones
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Activity className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Activity Yet</h3>
                        <p className="text-slate-600 dark:text-slate-400">
                          Customer activity will appear here once they start placing orders.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/60 dark:border-slate-700/60">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Order History
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Complete order history for this customer
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Orders Yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                          This customer hasn't placed any orders yet.
                        </p>
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                          onClick={() => {
                            info("Navigate to Order", `Redirecting to create order for ${customer.name}`)
                            router.push(localizedHref(`/dashboard/sales/new?customerId=${customer.id}`))
                          }}
                        >
                          <Plus className="w-4 h-4 me-2" />
                          Create Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200/60 dark:border-slate-700/60">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Activity Timeline
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Chronological activity and interaction history
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Customer Created Activity */}
                        <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mt-1">
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                                Customer Created
                              </h4>
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                System
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Customer profile was created and added to the system
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <Calendar className="h-3 w-3" />
                              {formatDistanceToNow(customer.createdAt, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

function CustomerProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-20" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-16 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <Skeleton className="h-12 w-full rounded-lg" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Skeleton className="h-3 w-20 mb-2" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-xl rounded-2xl">
                <CardContent className="p-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

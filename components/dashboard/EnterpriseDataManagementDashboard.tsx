"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  Filter,
  Tag,
  Ruler,
  Percent,
  Database,
  Loader2,
  Search,
  Download,
  Upload,
  Settings,
  RefreshCw,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Users,
  Shield,
  Zap,
  Globe,
  Archive,
  FileText,
  Calendar,
  Target,
  Bell,
  Info
} from "lucide-react"
import { CategoriesTable } from "@/components/tables/categories-table"
import { BrandsTable } from "@/components/tables/brands-table"
import { UnitsTable } from "@/components/tables/units-table"
import { TaxRatesTable } from "@/components/tables/tax-rates-table"
import { CategoryDTO } from "@/types/category"
import { BrandDTO } from "@/types/brand"
import { UnitDTO } from "@/types/unit"
import { TaxRateDTO } from "@/types/taxRates"

interface DataManagementStats {
  totalRecords: number
  recentChanges: number
  activeUsers: number
  dataQualityScore: number
  lastSyncTime: Date
}

interface DataManagementDashboardProps {
  organizationId: string
  onCategoryEdit?: (category: CategoryDTO) => void
  onCategoryDelete?: (categoryId: string) => void
  onCategoryCreate?: () => void
  onBrandEdit?: (brand: BrandDTO) => void
  onBrandDelete?: (brandId: string) => void
  onBrandCreate?: () => void
  onUnitEdit?: (unit: UnitDTO) => void
  onUnitDelete?: (unitId: string) => void
  onUnitCreate?: () => void
  onTaxRateEdit?: (taxRate: TaxRateDTO) => void
  onTaxRateDelete?: (taxRateId: string) => void
  onTaxRateCreate?: () => void
}

export default function EnterpriseDataManagementDashboard({
  organizationId,
  onCategoryEdit,
  onCategoryDelete,
  onCategoryCreate,
  onBrandEdit,
  onBrandDelete,
  onBrandCreate,
  onUnitEdit,
  onUnitDelete,
  onUnitCreate,
  onTaxRateEdit,
  onTaxRateDelete,
  onTaxRateCreate,
}: DataManagementDashboardProps) {
  const [categories, setCategories] = useState<CategoryDTO[]>([])
  const [brands, setBrands] = useState<BrandDTO[]>([])
  const [units, setUnits] = useState<UnitDTO[]>([])
  const [taxRates, setTaxRates] = useState<TaxRateDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState("overview")
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState<DataManagementStats>({
    totalRecords: 0,
    recentChanges: 0,
    activeUsers: 0,
    dataQualityScore: 0,
    lastSyncTime: new Date(),
  })
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Mock comprehensive data for demonstration
        const mockCategories: CategoryDTO[] = [
          {
            id: "cat-1",
            title: "Electronics & Technology",
            slug: "electronics-technology",
            description: "Cutting-edge electronic devices, computers, and technology accessories",
            organizationId: organizationId,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20"),
            imageUrl: "https://example.com/electronics.jpg",
          },
          {
            id: "cat-2",
            title: "Fashion & Apparel",
            slug: "fashion-apparel",
            description: "Premium clothing, accessories, and fashion items for all demographics",
            organizationId: organizationId,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-18"),
            imageUrl: "https://example.com/fashion.jpg",
          },
          {
            id: "cat-3",
            title: "Home & Garden",
            slug: "home-garden",
            description: "Quality home improvement, furniture, and gardening products",
            organizationId: organizationId,
            createdAt: new Date("2024-01-12"),
            updatedAt: new Date("2024-01-22"),
            imageUrl: null,
          },
          {
            id: "cat-4",
            title: "Health & Beauty",
            slug: "health-beauty",
            description: "Personal care, health supplements, and beauty products",
            organizationId: organizationId,
            createdAt: new Date("2024-01-08"),
            updatedAt: new Date("2024-01-19"),
            imageUrl: null,
          },
        ]

        const mockBrands: BrandDTO[] = [
          {
            id: "brand-1",
            brandName: "Apple Inc.",
            slug: "apple-inc",
            organizationId: organizationId,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20"),
          },
          {
            id: "brand-2",
            brandName: "Samsung Electronics",
            slug: "samsung-electronics",
            organizationId: organizationId,
            createdAt: new Date("2024-01-12"),
            updatedAt: new Date("2024-01-18"),
          },
          {
            id: "brand-3",
            brandName: "Nike Corporation",
            slug: "nike-corporation",
            organizationId: organizationId,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-17"),
          },
          {
            id: "brand-4",
            brandName: "Adidas Group",
            slug: "adidas-group",
            organizationId: organizationId,
            createdAt: new Date("2024-01-14"),
            updatedAt: new Date("2024-01-21"),
          },
          {
            id: "brand-5",
            brandName: "Sony Corporation",
            slug: "sony-corporation",
            organizationId: organizationId,
            createdAt: new Date("2024-01-16"),
            updatedAt: new Date("2024-01-23"),
          },
        ]

        const mockUnits: UnitDTO[] = [
          {
            id: "unit-1",
            name: "Kilogram",
            symbol: "kg",
            organizationId: organizationId,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20"),
          },
          {
            id: "unit-2",
            name: "Meter",
            symbol: "m",
            organizationId: organizationId,
            createdAt: new Date("2024-01-12"),
            updatedAt: new Date("2024-01-18"),
          },
          {
            id: "unit-3",
            name: "Liter",
            symbol: "L",
            organizationId: organizationId,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-17"),
          },
          {
            id: "unit-4",
            name: "Piece",
            symbol: "pcs",
            organizationId: organizationId,
            createdAt: new Date("2024-01-14"),
            updatedAt: new Date("2024-01-21"),
          },
          {
            id: "unit-5",
            name: "Box",
            symbol: "box",
            organizationId: organizationId,
            createdAt: new Date("2024-01-16"),
            updatedAt: new Date("2024-01-23"),
          },
        ]

        const mockTaxRates: TaxRateDTO[] = [
          {
            id: "tax-1",
            taxRateName: "Standard VAT",
            rate: 20.0,
            organizationId: organizationId,
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-20"),
          },
          {
            id: "tax-2",
            taxRateName: "Reduced VAT",
            rate: 5.0,
            organizationId: organizationId,
            createdAt: new Date("2024-01-12"),
            updatedAt: new Date("2024-01-18"),
          },
          {
            id: "tax-3",
            taxRateName: "Zero Rate VAT",
            rate: 0.0,
            organizationId: organizationId,
            createdAt: new Date("2024-01-10"),
            updatedAt: new Date("2024-01-17"),
          },
          {
            id: "tax-4",
            taxRateName: "Luxury Tax",
            rate: 25.0,
            organizationId: organizationId,
            createdAt: new Date("2024-01-14"),
            updatedAt: new Date("2024-01-21"),
          },
        ]

        // Calculate stats
        const totalRecords = mockCategories.length + mockBrands.length + mockUnits.length + mockTaxRates.length
        const mockStats: DataManagementStats = {
          totalRecords,
          recentChanges: 12,
          activeUsers: 8,
          dataQualityScore: 94.5,
          lastSyncTime: new Date(),
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        setCategories(mockCategories)
        setBrands(mockBrands)
        setUnits(mockUnits)
        setTaxRates(mockTaxRates)
        setStats(mockStats)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [organizationId])

  const refreshData = () => {
    setLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setLoading(false)
      setStats(prev => ({ ...prev, lastSyncTime: new Date() }))
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80 flex items-center justify-center">
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-teal-50/90 to-cyan-50/90 backdrop-blur-md">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full bg-teal-400/20"></div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-teal-800 mb-2">Loading Enterprise Dashboard</h3>
              <p className="text-teal-600">Fetching your data management systems...</p>
              <Progress value={75} className="w-64 mt-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80">
      {/* Header Section */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-gradient-to-r from-cyan-100/90 via-teal-50/90 to-sky-100/90 border-b border-teal-200/30 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 bg-clip-text text-transparent flex items-center">
                  <Database className="mr-3 h-8 w-8 text-teal-600" />
                  Enterprise Data Management
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-teal-600 text-lg">
                    Comprehensive master data administration and analytics platform
                  </p>
                  <Badge variant="outline" className="text-xs border-teal-200 bg-teal-50/70 text-teal-700">
                    <Shield className="h-3 w-3 mr-1" />
                    Enterprise Grade
                  </Badge>
                  <Badge variant="outline" className="text-xs border-cyan-200 bg-cyan-50/70 text-cyan-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentTime.toLocaleTimeString()}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-500" />
                <Input
                  placeholder="Search across all data..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-teal-50/80 backdrop-blur-sm border-teal-200/50 focus:border-teal-400 focus:ring-teal-300/30"
                />
              </div>

              <Separator orientation="vertical" className="h-8" />

              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={loading}
                className="bg-teal-50/80 backdrop-blur-sm border-teal-200/60 hover:bg-teal-100/70 text-teal-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sync
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-cyan-50/80 backdrop-blur-sm border-cyan-200/60 hover:bg-cyan-100/70 text-cyan-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-sky-50/80 backdrop-blur-sm border-sky-200/60 hover:bg-sky-100/70 text-sky-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-teal-50/80 backdrop-blur-sm border-teal-200/60 hover:bg-teal-100/70 text-teal-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* System Status Alert */}
        <Alert className="border-teal-200 bg-gradient-to-r from-teal-50/70 to-cyan-50/70 backdrop-blur-sm">
          <CheckCircle className="h-4 w-4 text-teal-500" />
          <AlertTitle className="text-teal-700">System Status: Operational</AlertTitle>
          <AlertDescription className="text-teal-600">
            All data management systems are running smoothly. Last sync: {stats.lastSyncTime.toLocaleString()}
          </AlertDescription>
        </Alert>

        {/* Enhanced Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-teal-600">Categories</p>
                <p className="text-3xl font-bold text-teal-800">{categories.length}</p>
                <p className="text-xs text-teal-600 mt-1">Active classifications</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-cyan-600">Brands</p>
                <p className="text-3xl font-bold text-cyan-800">{brands.length}</p>
                <p className="text-xs text-cyan-600 mt-1">Registered brands</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Ruler className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-600">Units</p>
                <p className="text-3xl font-bold text-emerald-800">{units.length}</p>
                <p className="text-xs text-emerald-600 mt-1">Measurement units</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg">
                  <Percent className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-sky-600">Tax Rates</p>
                <p className="text-3xl font-bold text-sky-800">{taxRates.length}</p>
                <p className="text-xs text-sky-600 mt-1">Active tax rates</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  <Target className="h-3 w-3 mr-1" />
                  94.5%
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600">Data Quality</p>
                <p className="text-3xl font-bold text-indigo-800">{stats.dataQualityScore}%</p>
                <Progress value={stats.dataQualityScore} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50/80 to-indigo-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Active Users</p>
                <p className="text-3xl font-bold text-purple-800">{stats.activeUsers}</p>
                <p className="text-xs text-purple-600 mt-1">Currently online</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md border border-teal-200/30">
            <TabsTrigger
              value="overview"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-teal-800"
            >
              <Filter className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-100/70 data-[state=active]:to-sky-100/70 data-[state=active]:text-cyan-800"
            >
              <Tag className="h-4 w-4" />
              <span>Brands</span>
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-100/70 data-[state=active]:to-teal-100/70 data-[state=active]:text-emerald-800"
            >
              <Ruler className="h-4 w-4" />
              <span>Units</span>
            </TabsTrigger>
            <TabsTrigger
              value="taxrates"
              className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-100/70 data-[state=active]:to-cyan-100/70 data-[state=active]:text-sky-800"
            >
              <Percent className="h-4 w-4" />
              <span>Tax Rates</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-teal-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Latest changes across all data entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-teal-50/50">
                      <div className="p-2 rounded-lg bg-teal-100">
                        <Filter className="h-4 w-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-teal-800">New category added</p>
                        <p className="text-xs text-teal-600">"Health & Beauty" - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-cyan-50/50">
                      <div className="p-2 rounded-lg bg-cyan-100">
                        <Tag className="h-4 w-4 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-cyan-800">Brand updated</p>
                        <p className="text-xs text-cyan-600">"Sony Corporation" - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-emerald-50/50">
                      <div className="p-2 rounded-lg bg-emerald-100">
                        <Percent className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-emerald-800">Tax rate modified</p>
                        <p className="text-xs text-emerald-600">"Luxury Tax" rate changed - 6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-teal-800 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-teal-600" />
                    System Health
                  </CardTitle>
                  <CardDescription className="text-teal-600">
                    Enterprise-grade monitoring and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-teal-700">Data Integrity</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>
                    </div>
                    <Progress value={98} className="h-3" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-teal-700">Performance</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Optimal</Badge>
                    </div>
                    <Progress value={94} className="h-3" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-teal-700">Security</span>
                      <Badge className="bg-green-100 text-green-800 border-green-200">Secured</Badge>
                    </div>
                    <Progress value={100} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesTable
              data={categories}
              onEdit={onCategoryEdit}
              onDelete={onCategoryDelete}
              onCreate={onCategoryCreate}
            />
          </TabsContent>

          <TabsContent value="brands">
            <BrandsTable
              data={brands}
              onEdit={onBrandEdit}
              onDelete={onBrandDelete}
              onCreate={onBrandCreate}
            />
          </TabsContent>

          <TabsContent value="units">
            <UnitsTable
              data={units}
              onEdit={onUnitEdit}
              onDelete={onUnitDelete}
              onCreate={onUnitCreate}
            />
          </TabsContent>

          <TabsContent value="taxrates">
            <TaxRatesTable
              data={taxRates}
              onEdit={onTaxRateEdit}
              onDelete={onTaxRateDelete}
              onCreate={onTaxRateCreate}
            />
          </TabsContent>
        </Tabs>

        {/* Enterprise Quick Actions Grid */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-teal-800 flex items-center">
              <Zap className="mr-2 h-5 w-5 text-teal-600" />
              Enterprise Quick Actions
            </CardTitle>
            <CardDescription className="text-teal-600">
              Streamlined operations for data management and administration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="group border-0 shadow-md bg-gradient-to-br from-teal-50 to-teal-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 shadow-md">
                    <Download className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-teal-800">Bulk Export</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-cyan-50 to-cyan-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-md">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-cyan-800">Bulk Import</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-sky-50 to-sky-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 shadow-md">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-sky-800">Reports</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                    <Archive className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald-800">Archive</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-md">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-indigo-800">Schedule</span>
                </CardContent>
              </Card>

              <Card className="group border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center justify-center h-24 space-y-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-purple-800">Settings</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
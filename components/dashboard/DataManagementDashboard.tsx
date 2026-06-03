"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Filter, Tag, Ruler, Percent, Database, Loader2 } from "lucide-react"
import { CategoriesTable } from "@/components/tables/categories-table"
import { BrandsTable } from "@/components/tables/brands-table"
import { UnitsTable } from "@/components/tables/units-table"
import { TaxRatesTable } from "@/components/tables/tax-rates-table"
import { CategoryDTO } from "@/types/category"
import { BrandDTO } from "@/types/brand"
import { UnitDTO } from "@/types/unit"
import { TaxRateDTO } from "@/types/taxRates"
import getOrgCategories from "@/actions/categories/getOrgCategories"
import { getBrandsAction } from "@/actions/brands/getBrandsAction"
import { getOrgUnits } from "@/actions/units/getUnitsAction"
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction"

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

export default function DataManagementDashboard({
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
  const [selectedTab, setSelectedTab] = useState("categories")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch real data from database
        const [categoriesResult, brandsResult, unitsResult, taxRatesResult] = await Promise.all([
          getOrgCategories(organizationId),
          getBrandsAction(organizationId),
          getOrgUnits(organizationId),
          getOrgTaxRates(organizationId)
        ])

        if (categoriesResult.success) {
          setCategories(categoriesResult.data || [])
        }

        if (brandsResult.success) {
          setBrands(brandsResult.data || [])
        }

        if (unitsResult.success) {
          setUnits(unitsResult.data || [])
        }

        if (taxRatesResult.success) {
          setTaxRates(taxRatesResult.data || [])
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [organizationId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mr-3" />
            <span className="text-teal-700 font-medium">Loading data management dashboard...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50/60 to-sky-100/80 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-700 bg-clip-text text-transparent flex items-center">
              <Database className="mr-3 h-8 w-8 text-teal-600" />
              Data Management Dashboard
            </CardTitle>
            <CardDescription className="text-teal-600 text-lg">
              Manage your organization's master data including categories, brands, units, and tax rates.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-teal-600">Categories</p>
                  <p className="text-3xl font-bold text-teal-800">{categories.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 shadow-lg">
                  <Filter className="h-6 w-6 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="mt-2 border-teal-200 bg-teal-50 text-teal-700">
                Active
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50/80 to-sky-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cyan-600">Brands</p>
                  <p className="text-3xl font-bold text-cyan-800">{brands.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg">
                  <Tag className="h-6 w-6 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="mt-2 border-cyan-200 bg-cyan-50 text-cyan-700">
                Active
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50/80 to-teal-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Units</p>
                  <p className="text-3xl font-bold text-emerald-800">{units.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                  <Ruler className="h-6 w-6 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="mt-2 border-emerald-200 bg-emerald-50 text-emerald-700">
                Active
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-sky-50/80 to-cyan-50/80 backdrop-blur-md hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-sky-600">Tax Rates</p>
                  <p className="text-3xl font-bold text-sky-800">{taxRates.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 shadow-lg">
                  <Percent className="h-6 w-6 text-white" />
                </div>
              </div>
              <Badge variant="outline" className="mt-2 border-sky-200 bg-sky-50 text-sky-700">
                Active
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-teal-50/80 to-cyan-50/80 backdrop-blur-md border border-teal-200/30">
            <TabsTrigger
              value="categories"
              className="flex items-center space-x-2 data-[state=active]:bg-teal-100/70 data-[state=active]:text-teal-800"
            >
              <Filter className="h-4 w-4" />
              <span>Categories</span>
            </TabsTrigger>
            <TabsTrigger
              value="brands"
              className="flex items-center space-x-2 data-[state=active]:bg-cyan-100/70 data-[state=active]:text-cyan-800"
            >
              <Tag className="h-4 w-4" />
              <span>Brands</span>
            </TabsTrigger>
            <TabsTrigger
              value="units"
              className="flex items-center space-x-2 data-[state=active]:bg-emerald-100/70 data-[state=active]:text-emerald-800"
            >
              <Ruler className="h-4 w-4" />
              <span>Units</span>
            </TabsTrigger>
            <TabsTrigger
              value="taxrates"
              className="flex items-center space-x-2 data-[state=active]:bg-sky-100/70 data-[state=active]:text-sky-800"
            >
              <Percent className="h-4 w-4" />
              <span>Tax Rates</span>
            </TabsTrigger>
          </TabsList>

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
      </div>
    </div>
  )
}

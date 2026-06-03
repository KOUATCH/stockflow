import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  Calendar,
  Edit,
  FileText,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  Users
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TaxRateDetailsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function TaxRateDetailsPage(props: TaxRateDetailsPageProps) {
  const params = 'id' in props.params ? props.params : await props.params;
  const taxRateId = params.id;

  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Organization Required</h3>
            <p className="text-muted-foreground">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    );
  }

  const taxRatesResponse = await getOrgTaxRates(userOrg);
  const taxRate = taxRatesResponse.success
    ? taxRatesResponse.data?.find(rate => rate.id === taxRateId)
    : null;

  if (!taxRate) {
    notFound();
  }

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getTaxRateCategory = (rate: number) => {
    if (rate === 0) {
      return {
        label: "Tax Free",
        color: "bg-gray-100 text-gray-700 border-gray-200",
        description: "No tax applied to items using this rate"
      };
    } else if (rate <= 5) {
      return {
        label: "Low Rate",
        color: "bg-green-100 text-green-700 border-green-200",
        description: "Reduced tax rate for essential items"
      };
    } else if (rate <= 15) {
      return {
        label: "Standard Rate",
        color: "bg-blue-100 text-blue-700 border-blue-200",
        description: "Standard tax rate for most items"
      };
    } else {
      return {
        label: "High Rate",
        color: "bg-red-100 text-red-700 border-red-200",
        description: "Premium tax rate for luxury items"
      };
    }
  };

  const category = getTaxRateCategory(Number(taxRate.rate));

  // Mock usage data - in a real app this would come from your database
  const mockUsageData = {
    itemsUsing: Math.floor(Math.random() * 50) + 10,
    transactionsThisMonth: Math.floor(Math.random() * 200) + 50,
    revenueThisMonth: Math.floor(Math.random() * 10000) + 5000,
    averageTransactionValue: Math.floor(Math.random() * 500) + 100,
    topCategories: [
      { name: "Electronics", usage: 45 },
      { name: "Clothing", usage: 32 },
      { name: "Food & Beverages", usage: 23 }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings/tax-rates">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tax Rates
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {taxRate.taxRateName}
                  </h1>
                  {taxRate.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Tax Rate Details & Usage Analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Tax Rate Information
                  </CardTitle>
                  <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Tax Rate Name
                    </label>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {taxRate.taxRateName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Rate Value
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                        {Number(taxRate.rate).toFixed(4)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={category.color}>
                      {category.label}
                    </Badge>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {category.description}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {mockUsageData.itemsUsing}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Items Using
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {mockUsageData.transactionsThisMonth}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Transactions
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      ${mockUsageData.revenueThisMonth.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Tax Revenue
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      ${mockUsageData.averageTransactionValue}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Avg Transaction
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white mb-3">
                    Top Categories Using This Rate
                  </h4>
                  <div className="space-y-2">
                    {mockUsageData.topCategories.map((cat, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border border-slate-100 dark:border-slate-800">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-violet-500 h-2 rounded-full"
                              style={{ width: `${cat.usage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {cat.usage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Calculation Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Calculation Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[100, 500, 1000].map((amount) => {
                    const tax = (amount * Number(taxRate.rate)) / 100;
                    const total = amount + tax;

                    return (
                      <div key={amount} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Base Price: ${amount}
                        </div>
                        <div className="text-sm text-violet-600 dark:text-violet-400 mb-1">
                          Tax: ${tax.toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-700 pt-2">
                          Total: ${total.toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Current Status
                  </label>
                  <Badge
                    variant={taxRate.isActive !== false ? "default" : "destructive"}
                    className={`flex items-center gap-1 w-fit ${
                      taxRate.isActive !== false
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      taxRate.isActive !== false ? "bg-green-500" : "bg-red-500"
                    }`}></div>
                    {taxRate.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {taxRate.isDefault && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default Rate
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Tax Rate
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/calculate`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Impact
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/settings`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Rate Settings
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/export`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Created Info */}
            <Card>
              <CardHeader>
                <CardTitle>Rate Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="text-slate-600 dark:text-slate-400">Created</div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {formatDate(taxRate.createdAt)}
                      </div>
                    </div>
                  </div>
                  {taxRate.updatedAt && taxRate.updatedAt !== taxRate.createdAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-600 dark:text-slate-400">Last Modified</div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatDate(taxRate.updatedAt)}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="text-slate-600 dark:text-slate-400">Organization ID</div>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                      {taxRate.organizationId}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
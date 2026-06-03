import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle,
  Package,
  Percent,
  ShoppingCart,
  Star,
  Trash2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DeleteTaxRatePageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function DeleteTaxRatePage(props: DeleteTaxRatePageProps) {
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

  // Mock usage data - in a real app this would come from your database
  const mockUsageData = {
    itemsUsing: Math.floor(Math.random() * 50) + 5,
    transactionsThisMonth: Math.floor(Math.random() * 200) + 10,
    totalTransactions: Math.floor(Math.random() * 1000) + 100
  };

  const isDefault = taxRate.isDefault === true;
  const hasActiveUsage = mockUsageData.itemsUsing > 0 || mockUsageData.transactionsThisMonth > 0;

  const canDelete = !isDefault && !hasActiveUsage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/settings/tax-rates/${taxRateId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Delete Tax Rate
                  </h1>
                  {taxRate.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Permanently delete {taxRate.taxRateName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Danger Alert */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Danger Zone:</strong> This action cannot be undone. Deleting a tax rate will permanently remove
              all associated data and historical records. Items currently using this rate will need to be reassigned.
            </AlertDescription>
          </Alert>

          {/* Tax Rate Overview */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Percent className="w-5 h-5" />
                Tax Rate to be Deleted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {Number(taxRate.rate).toFixed(4)}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                    <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockUsageData.transactionsThisMonth}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    This Month
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {mockUsageData.totalTransactions}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Total Transactions
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Requirements */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Delete Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {!isDefault ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Not a default tax rate
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isDefault
                        ? "This is a default tax rate and cannot be deleted. Please set another rate as default first."
                        : "This tax rate is not set as default and can be deleted."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mockUsageData.itemsUsing === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      No items using this rate
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {mockUsageData.itemsUsing > 0
                        ? `${mockUsageData.itemsUsing} items are currently using this tax rate. Reassign them to other rates before deleting.`
                        : "No items are currently assigned to this tax rate."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {mockUsageData.transactionsThisMonth === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      No recent transactions
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {mockUsageData.transactionsThisMonth > 0
                        ? `This rate has been used in ${mockUsageData.transactionsThisMonth} transactions this month. Wait for the period to close or complete pending transactions.`
                        : "No recent transactions are using this tax rate."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Loss Warning */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Data Loss Warning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>The following data will be permanently deleted:</strong>
                </p>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Tax rate configuration and settings
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Historical transaction records using this rate
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Tax calculation history and analytics
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Financial reports and compliance data
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Consider These Alternatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                    Deactivate Tax Rate
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Disable the rate while preserving all historical data and settings.
                  </p>
                  <Link href={`/dashboard/settings/tax-rates/${taxRateId}/settings`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Deactivate Instead
                    </Button>
                  </Link>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                    Export Data
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Download all tax rate data and usage history before deletion.
                  </p>
                  <Link href={`/dashboard/settings/tax-rates/${taxRateId}/export`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Export Data
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Section */}
          {canDelete && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="confirm-understand" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="confirm-understand"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I understand that this action cannot be undone
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        All tax rate data will be permanently deleted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="confirm-backup" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="confirm-backup"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I have backed up all necessary data
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Important tax data has been exported or backed up
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/dashboard/settings/tax-rates/${taxRateId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Link href={`/dashboard/settings/tax-rates/${taxRateId}/settings`}>
              <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                Deactivate Instead
              </Button>
            </Link>
            <Button
              variant="destructive"
              disabled={!canDelete}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {canDelete ? "Delete Tax Rate" : "Cannot Delete"}
            </Button>
          </div>

          {!canDelete && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This tax rate cannot be deleted yet. Please resolve the requirements above before proceeding.
                Consider deactivating the rate instead to preserve historical data.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
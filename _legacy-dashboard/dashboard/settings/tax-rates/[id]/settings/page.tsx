import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  Percent,
  Save,
  Settings,
  Shield,
  Star
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface TaxRateSettingsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function TaxRateSettingsPage(props: TaxRateSettingsPageProps) {
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Tax Rate Settings
                  </h1>
                  {taxRate.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Configure {taxRate.taxRateName} settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tax Rate Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Tax Rate Status
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enable or disable this tax rate for calculations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={taxRate.isActive !== false}
                    // onChange handler would be implemented in client component
                  />
                  <Badge
                    variant={taxRate.isActive !== false ? "default" : "destructive"}
                    className={`flex items-center gap-1 ${
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
              </div>

              {/* Default Tax Rate */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Default Tax Rate
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set as the default tax rate for new items and transactions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={taxRate.isDefault === true}
                    // onChange handler would be implemented in client component
                  />
                  {taxRate.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Application Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Apply to New Items */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Auto Apply to New Items
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically assign this rate to new inventory items
                  </p>
                </div>
                <Switch
                  // Mock setting - would be stored in database
                  defaultChecked={false}
                />
              </div>

              {/* Apply to Existing Items */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Include in Bulk Updates
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Include this rate in bulk tax rate update operations
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>

              {/* Round Tax Calculations */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Round Tax Calculations
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Round tax amounts to the nearest cent for transactions
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>

              {/* Display in Reports */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Display in Tax Reports
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Include this rate in automated tax reports and analytics
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Calculation Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculation Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Compound with Other Rates */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Compound with Other Rates
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Apply this rate on top of other applicable tax rates
                  </p>
                </div>
                <Switch
                  defaultChecked={false}
                />
              </div>

              {/* Tax Inclusive Pricing */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Tax Inclusive Pricing
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Calculate tax as included in the displayed price
                  </p>
                </div>
                <Switch
                  defaultChecked={false}
                />
              </div>

              {/* Apply to Discounted Items */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Apply to Discounted Items
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Calculate tax based on discounted price, not original price
                  </p>
                </div>
                <Switch
                  defaultChecked={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Rate Modification Permissions
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Control who can modify this tax rate and its settings
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Audit Trail
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Track all changes made to this tax rate for compliance
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    View History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Rate Information */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Tax Rate Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Rate Name
                  </label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {taxRate.taxRateName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Current Rate
                  </label>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {Number(taxRate.rate).toFixed(4)}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To update rate information, use the edit form
                </p>
                <Link href={`/dashboard/settings/tax-rates/${taxRateId}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Tax Rate
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/dashboard/settings/tax-rates/${taxRateId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgTaxRates } from "@/actions/taxes/getTaxRatesAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  DollarSign,
  Percent,
  Star,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CalculateImpactPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function CalculateImpactPage(props: CalculateImpactPageProps) {
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

  // Mock data for impact analysis
  const mockImpactData = {
    currentRevenue: 50000,
    estimatedTransactions: 1500,
    averageOrderValue: 125,
    itemsAffected: 45,
    scenarios: [
      { name: "Conservative", rateChange: -1, description: "Reduce rate by 1%" },
      { name: "Current Rate", rateChange: 0, description: "Keep current rate" },
      { name: "Moderate", rateChange: 1, description: "Increase rate by 1%" },
      { name: "Aggressive", rateChange: 2.5, description: "Increase rate by 2.5%" }
    ]
  };

  const calculateScenario = (baseRate: number, change: number, revenue: number) => {
    const newRate = Math.max(0, baseRate + change);
    const rateImpact = change / 100; // Convert percentage to decimal
    const estimatedRevenueChange = revenue * rateImpact;
    const newRevenue = revenue + estimatedRevenueChange;
    const taxRevenue = newRevenue * (newRate / 100);

    return {
      newRate,
      revenueChange: estimatedRevenueChange,
      newRevenue,
      taxRevenue,
      percentChange: (estimatedRevenueChange / revenue) * 100
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Tax Impact Calculator
                  </h1>
                  {taxRate.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Analyze the financial impact of tax rate changes for {taxRate.taxRateName}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calculator */}
          <div className="lg:col-span-2 space-y-6">
            {/* Custom Calculator */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Custom Rate Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseAmount">Base Amount ($)</Label>
                    <Input
                      id="baseAmount"
                      type="number"
                      placeholder="100.00"
                      defaultValue="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRate">New Rate (%)</Label>
                    <Input
                      id="newRate"
                      type="number"
                      step="0.01"
                      placeholder={Number(taxRate.rate).toFixed(2)}
                      defaultValue={Number(taxRate.rate).toFixed(2)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full">
                      Calculate
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Current Tax</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">
                      ${(100 * Number(taxRate.rate) / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">New Tax</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${(100 * Number(taxRate.rate) / 100).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400">Difference</div>
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      $0.00
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scenario Analysis */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockImpactData.scenarios.map((scenario, index) => {
                    const analysis = calculateScenario(
                      Number(taxRate.rate),
                      scenario.rateChange,
                      mockImpactData.currentRevenue
                    );

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          scenario.rateChange === 0
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {scenario.name}
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {scenario.description}
                            </p>
                          </div>
                          <Badge
                            variant={scenario.rateChange === 0 ? "default" : "outline"}
                            className={`${
                              scenario.rateChange === 0
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : ""
                            }`}
                          >
                            {analysis.newRate.toFixed(2)}%
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Tax Revenue</div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              ${analysis.taxRevenue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Revenue Change</div>
                            <div className={`font-semibold flex items-center gap-1 ${
                              analysis.revenueChange >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {analysis.revenueChange >= 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              ${Math.abs(analysis.revenueChange).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Total Revenue</div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              ${analysis.newRevenue.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-600 dark:text-slate-400">Impact</div>
                            <div className={`font-semibold ${
                              analysis.percentChange >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                              {analysis.percentChange >= 0 ? "+" : ""}{analysis.percentChange.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Market Comparison */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Market Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { region: "National Average", rate: 8.25, status: "higher" },
                    { region: "Regional Average", rate: 7.5, status: "higher" },
                    { region: "Industry Standard", rate: Number(taxRate.rate), status: "equal" },
                    { region: "Competitor A", rate: 6.75, status: "lower" },
                    { region: "Competitor B", rate: 9.0, status: "higher" }
                  ].map((comparison, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded border border-slate-200 dark:border-slate-700"
                    >
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {comparison.region}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          {comparison.rate.toFixed(2)}%
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            comparison.status === "higher"
                              ? "text-red-600 border-red-200 bg-red-50"
                              : comparison.status === "lower"
                              ? "text-green-600 border-green-200 bg-green-50"
                              : "text-blue-600 border-blue-200 bg-blue-50"
                          }`}
                        >
                          {comparison.status === "equal" ? "Current" : comparison.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Rate Info */}
            <Card>
              <CardHeader>
                <CardTitle>Current Rate</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-3">
                <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                  {Number(taxRate.rate).toFixed(2)}%
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white">
                  {taxRate.taxRateName}
                </div>
                <Badge variant="outline">
                  {Number(taxRate.rate) === 0 ? "Tax Free" :
                   Number(taxRate.rate) <= 5 ? "Low Rate" :
                   Number(taxRate.rate) <= 15 ? "Standard Rate" : "High Rate"}
                </Badge>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Impact Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Items Affected</span>
                  <span className="font-semibold">{mockImpactData.itemsAffected}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Est. Transactions</span>
                  <span className="font-semibold">{mockImpactData.estimatedTransactions.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Avg Order Value</span>
                  <span className="font-semibold">${mockImpactData.averageOrderValue}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Current Revenue</span>
                  <span className="font-bold">${mockImpactData.currentRevenue.toLocaleString()}</span>
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
                    <Percent className="w-4 h-4 mr-2" />
                    Adjust Rate
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/tax-rates/${taxRate.id}/export`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Export Analysis
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Calculator className="w-4 h-4 mr-2" />
                  Save Scenario
                </Button>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20">
              <CardHeader>
                <CardTitle className="text-emerald-800 dark:text-emerald-200">
                  Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-emerald-700 dark:text-emerald-300">
                <p>
                  Based on market analysis, your current rate is competitive.
                  Consider the "Moderate" scenario for optimal balance between
                  revenue and market positioning.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

// =============================================================================
// CASH FLOW STATEMENT PAGE
// Comprehensive cash flow reporting with operating, investing, and financing activities
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Printer,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Shield,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Building2,
  Banknote
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockCashFlowData = {
  period: "Year Ended December 31, 2024",
  currency: "USD",
  operatingActivities: {
    netIncome: 280000,
    adjustments: {
      depreciation: 65000,
      amortization: 15000,
      badDebtExpense: 8000,
      gainOnSaleOfAssets: -12000,
    },
    workingCapitalChanges: {
      accountsReceivable: -25000,
      inventory: 18000,
      prepaidExpenses: -5000,
      accountsPayable: 15000,
      accruedExpenses: 8000,
    },
    netCashFromOperating: 367000
  },
  investingActivities: {
    purchaseOfEquipment: -125000,
    saleOfInvestments: 45000,
    acquisitionOfBusiness: -200000,
    netCashFromInvesting: -280000
  },
  financingActivities: {
    proceedsFromLoan: 150000,
    repaymentOfDebt: -85000,
    dividendsPaid: -75000,
    shareRepurchase: -50000,
    netCashFromFinancing: -60000
  },
  netCashChange: 27000,
  cashBeginning: 98000,
  cashEnding: 125000
};

interface CashFlowLineProps {
  label: string;
  amount: number;
  level?: number;
  bold?: boolean;
  trend?: 'up' | 'down' | 'stable';
  isNegative?: boolean;
}

const CashFlowLine: React.FC<CashFlowLineProps> = ({
  label,
  amount,
  level = 0,
  bold = false,
  trend,
  isNegative = false
}) => {
  const formatCurrency = (value: number) => {
    const absValue = Math.abs(value);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue);

    if (value < 0 || isNegative) {
      return `(${formatted})`;
    }
    return formatted;
  };

  const paddingLeft = level * 24;

  return (
    <div
      className={`flex justify-between items-center py-2 px-4 hover:bg-gray-50 ${
        bold ? 'font-semibold border-t border-b bg-gray-100' : ''
      }`}
      style={{ paddingLeft: paddingLeft + 16 }}
    >
      <div className="flex items-center gap-2">
        <span className={bold ? 'font-semibold' : 'text-gray-700'}>
          {label}
        </span>
        {trend && (
          <div className="flex items-center gap-1">
            {trend === 'up' && <ArrowUp className="h-3 w-3 text-green-600" />}
            {trend === 'down' && <ArrowDown className="h-3 w-3 text-red-600" />}
          </div>
        )}
      </div>
      <span className={`text-right ${bold ? 'font-semibold' : ''} ${
        amount < 0 || isNegative ? 'text-red-600' : 'text-gray-900'
      }`}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
};

export default function CashFlowPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cashFlowData, setCashFlowData] = useState(mockCashFlowData);
  const [activeTab, setActiveTab] = useState('statement');
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadCashFlow = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setCashFlowData(mockCashFlowData);
      } catch (error) {
        console.error('Failed to load cash flow statement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCashFlow();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting cash flow statement as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('Cash flow statement generated');
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (authError) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user authentication. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the cash flow statement.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const calculateMetrics = () => {
    const { operatingActivities, investingActivities, financingActivities } = cashFlowData;
    return {
      operatingCashFlow: operatingActivities.netCashFromOperating,
      freeCashFlow: operatingActivities.netCashFromOperating + investingActivities.netCashFromInvesting,
      cashFlowCoverage: (operatingActivities.netCashFromOperating / Math.abs(financingActivities.dividendsPaid)).toFixed(2),
      operatingCashRatio: (operatingActivities.netCashFromOperating / 145000).toFixed(2) // current liabilities
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
          <p className="text-gray-600 mt-1">
            {cashFlowData.period}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Cash Flow</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${cashFlowData.operatingActivities.netCashFromOperating.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Cash Flow</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${metrics.freeCashFlow.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Strong cash generation
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Position</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${cashFlowData.cashEnding.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              +${cashFlowData.netCashChange.toLocaleString()} net change
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Coverage Ratio</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cashFlowCoverage}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Excellent coverage
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statement">Cash Flow Statement</TabsTrigger>
          <TabsTrigger value="analysis">Cash Flow Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends & Forecasting</TabsTrigger>
        </TabsList>

        {/* Cash Flow Statement Tab */}
        <TabsContent value="statement" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Statement of Cash Flows</CardTitle>
                <CardDescription>
                  {cashFlowData.period} • All amounts in {cashFlowData.currency}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-6">
                {/* Operating Activities */}
                <div>
                  <CashFlowLine
                    label="CASH FLOWS FROM OPERATING ACTIVITIES"
                    amount={cashFlowData.operatingActivities.netCashFromOperating}
                    bold={true}
                  />
                  <CashFlowLine
                    label="Net Income"
                    amount={cashFlowData.operatingActivities.netIncome}
                    level={1}
                    trend="up"
                  />

                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                    Adjustments to reconcile net income to operating cash flow:
                  </div>

                  <CashFlowLine
                    label="Depreciation and Amortization"
                    amount={cashFlowData.operatingActivities.adjustments.depreciation + cashFlowData.operatingActivities.adjustments.amortization}
                    level={1}
                  />
                  <CashFlowLine
                    label="Bad Debt Expense"
                    amount={cashFlowData.operatingActivities.adjustments.badDebtExpense}
                    level={1}
                  />
                  <CashFlowLine
                    label="Gain on Sale of Assets"
                    amount={cashFlowData.operatingActivities.adjustments.gainOnSaleOfAssets}
                    level={1}
                    isNegative={true}
                  />

                  <div className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50">
                    Changes in operating assets and liabilities:
                  </div>

                  <CashFlowLine
                    label="Accounts Receivable"
                    amount={cashFlowData.operatingActivities.workingCapitalChanges.accountsReceivable}
                    level={1}
                    isNegative={cashFlowData.operatingActivities.workingCapitalChanges.accountsReceivable < 0}
                  />
                  <CashFlowLine
                    label="Inventory"
                    amount={cashFlowData.operatingActivities.workingCapitalChanges.inventory}
                    level={1}
                  />
                  <CashFlowLine
                    label="Prepaid Expenses"
                    amount={cashFlowData.operatingActivities.workingCapitalChanges.prepaidExpenses}
                    level={1}
                    isNegative={cashFlowData.operatingActivities.workingCapitalChanges.prepaidExpenses < 0}
                  />
                  <CashFlowLine
                    label="Accounts Payable"
                    amount={cashFlowData.operatingActivities.workingCapitalChanges.accountsPayable}
                    level={1}
                  />
                  <CashFlowLine
                    label="Accrued Expenses"
                    amount={cashFlowData.operatingActivities.workingCapitalChanges.accruedExpenses}
                    level={1}
                  />

                  <CashFlowLine
                    label="Net Cash Provided by Operating Activities"
                    amount={cashFlowData.operatingActivities.netCashFromOperating}
                    level={0}
                    bold={true}
                  />
                </div>

                {/* Investing Activities */}
                <div>
                  <CashFlowLine
                    label="CASH FLOWS FROM INVESTING ACTIVITIES"
                    amount={cashFlowData.investingActivities.netCashFromInvesting}
                    bold={true}
                  />
                  <CashFlowLine
                    label="Purchase of Property, Plant & Equipment"
                    amount={cashFlowData.investingActivities.purchaseOfEquipment}
                    level={1}
                    isNegative={true}
                    trend="down"
                  />
                  <CashFlowLine
                    label="Proceeds from Sale of Investments"
                    amount={cashFlowData.investingActivities.saleOfInvestments}
                    level={1}
                  />
                  <CashFlowLine
                    label="Acquisition of Business"
                    amount={cashFlowData.investingActivities.acquisitionOfBusiness}
                    level={1}
                    isNegative={true}
                  />
                  <CashFlowLine
                    label="Net Cash Used in Investing Activities"
                    amount={cashFlowData.investingActivities.netCashFromInvesting}
                    level={0}
                    bold={true}
                  />
                </div>

                {/* Financing Activities */}
                <div>
                  <CashFlowLine
                    label="CASH FLOWS FROM FINANCING ACTIVITIES"
                    amount={cashFlowData.financingActivities.netCashFromFinancing}
                    bold={true}
                  />
                  <CashFlowLine
                    label="Proceeds from Long-term Debt"
                    amount={cashFlowData.financingActivities.proceedsFromLoan}
                    level={1}
                    trend="up"
                  />
                  <CashFlowLine
                    label="Repayment of Long-term Debt"
                    amount={cashFlowData.financingActivities.repaymentOfDebt}
                    level={1}
                    isNegative={true}
                  />
                  <CashFlowLine
                    label="Dividends Paid"
                    amount={cashFlowData.financingActivities.dividendsPaid}
                    level={1}
                    isNegative={true}
                  />
                  <CashFlowLine
                    label="Share Repurchase"
                    amount={cashFlowData.financingActivities.shareRepurchase}
                    level={1}
                    isNegative={true}
                  />
                  <CashFlowLine
                    label="Net Cash Used in Financing Activities"
                    amount={cashFlowData.financingActivities.netCashFromFinancing}
                    level={0}
                    bold={true}
                  />
                </div>

                {/* Net Change in Cash */}
                <div className="border-t-2 border-gray-900 pt-4">
                  <CashFlowLine
                    label="Net Increase in Cash and Cash Equivalents"
                    amount={cashFlowData.netCashChange}
                    bold={true}
                  />
                  <CashFlowLine
                    label="Cash and Cash Equivalents, Beginning of Year"
                    amount={cashFlowData.cashBeginning}
                    level={0}
                  />
                  <CashFlowLine
                    label="Cash and Cash Equivalents, End of Year"
                    amount={cashFlowData.cashEnding}
                    level={0}
                    bold={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Quality</CardTitle>
                <CardDescription>Operating cash flow strength analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Operating Cash Flow:</span>
                  <Badge variant="outline" className="text-green-700 border-green-700">
                    ${metrics.operatingCashFlow.toLocaleString()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Free Cash Flow:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-700">
                    ${metrics.freeCashFlow.toLocaleString()}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Strong operating cash flow indicates healthy core business operations and earnings quality.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Management</CardTitle>
                <CardDescription>Liquidity and cash utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Cash Flow Coverage:</span>
                  <Badge variant="outline" className="text-purple-700 border-purple-700">
                    {metrics.cashFlowCoverage}x
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Operating Cash Ratio:</span>
                  <span className="font-semibold">{metrics.operatingCashRatio}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Excellent cash flow coverage for dividend payments and debt obligations.
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Breakdown</CardTitle>
              <CardDescription>Analysis by activity type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">
                    ${cashFlowData.operatingActivities.netCashFromOperating.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Operating Activities</div>
                  <div className="text-xs text-green-600 mt-1">Cash Generating</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-red-50">
                  <div className="text-2xl font-bold text-red-600">
                    (${Math.abs(cashFlowData.investingActivities.netCashFromInvesting).toLocaleString()})
                  </div>
                  <div className="text-sm text-gray-600">Investing Activities</div>
                  <div className="text-xs text-blue-600 mt-1">Growth Investment</div>
                </div>
                <div className="text-center p-4 border rounded-lg bg-orange-50">
                  <div className="text-2xl font-bold text-orange-600">
                    (${Math.abs(cashFlowData.financingActivities.netCashFromFinancing).toLocaleString()})
                  </div>
                  <div className="text-sm text-gray-600">Financing Activities</div>
                  <div className="text-xs text-purple-600 mt-1">Capital Management</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Trends</CardTitle>
              <CardDescription>Historical and projected cash flow patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Operating Cash Flow Trend</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Year:</span>
                        <span className="font-medium">${cashFlowData.operatingActivities.netCashFromOperating.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Previous Year:</span>
                        <span className="font-medium">$318,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Growth:</span>
                        <Badge variant="outline" className="text-green-700 border-green-700">
                          +15.4%
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Free Cash Flow Trend</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">This Year:</span>
                        <span className="font-medium">${metrics.freeCashFlow.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Previous Year:</span>
                        <span className="font-medium">$165,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Growth:</span>
                        <Badge variant="outline" className="text-green-700 border-green-700">
                          -47.3%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Cash Flow Outlook:</strong> Strong operating cash flow growth with strategic investments
                    in growth initiatives. Expected return to higher free cash flow levels in next period.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
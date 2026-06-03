"use client";

// =============================================================================
// BALANCE SHEET PAGE
// Comprehensive balance sheet reporting with assets, liabilities, and equity
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
  Building,
  CreditCard
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockBalanceSheetData = {
  period: "December 31, 2024",
  currency: "USD",
  assets: {
    currentAssets: {
      cash: 125000,
      accountsReceivable: 85000,
      inventory: 240000,
      prepaidExpenses: 15000,
      total: 465000
    },
    nonCurrentAssets: {
      propertyPlantEquipment: 750000,
      intangibleAssets: 125000,
      investments: 300000,
      total: 1175000
    },
    totalAssets: 1640000
  },
  liabilities: {
    currentLiabilities: {
      accountsPayable: 65000,
      shortTermDebt: 45000,
      accruedExpenses: 35000,
      total: 145000
    },
    nonCurrentLiabilities: {
      longTermDebt: 400000,
      deferredTaxLiabilities: 45000,
      total: 445000
    },
    totalLiabilities: 590000
  },
  equity: {
    paidInCapital: 800000,
    retainedEarnings: 250000,
    totalEquity: 1050000
  }
};

interface BalanceSheetLineProps {
  label: string;
  amount: number;
  level?: number;
  bold?: boolean;
  trend?: 'up' | 'down' | 'stable';
  percentage?: number;
}

const BalanceSheetLine: React.FC<BalanceSheetLineProps> = ({
  label,
  amount,
  level = 0,
  bold = false,
  trend,
  percentage
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
            {percentage && (
              <span className={`text-xs ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {percentage > 0 ? '+' : ''}{percentage}%
              </span>
            )}
          </div>
        )}
      </div>
      <span className={`text-right ${bold ? 'font-semibold' : ''}`}>
        {formatCurrency(amount)}
      </span>
    </div>
  );
};

export default function BalanceSheetPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balanceSheetData, setBalanceSheetData] = useState(mockBalanceSheetData);
  const [activeTab, setActiveTab] = useState('statement');
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadBalanceSheet = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBalanceSheetData(mockBalanceSheetData);
      } catch (error) {
        console.error('Failed to load balance sheet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBalanceSheet();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting balance sheet as ${format}`);
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
      console.log('Balance sheet generated');
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
            Please log in to access the balance sheet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const calculateRatios = () => {
    const { assets, liabilities, equity } = balanceSheetData;
    return {
      currentRatio: (assets.currentAssets.total / liabilities.currentLiabilities.total).toFixed(2),
      debtToEquity: (liabilities.totalLiabilities / equity.totalEquity).toFixed(2),
      assetTurnover: (assets.totalAssets / equity.totalEquity).toFixed(2),
      workingCapital: assets.currentAssets.total - liabilities.currentLiabilities.total
    };
  };

  const ratios = calculateRatios();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="text-gray-600 mt-1">
            Financial position as of {balanceSheetData.period}
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
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceSheetData.assets.totalAssets.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceSheetData.liabilities.totalLiabilities.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5.2% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balanceSheetData.equity.totalEquity.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18.3% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ratios.currentRatio}</div>
            <div className="flex items-center text-xs text-green-600">
              <ArrowUp className="h-3 w-3 mr-1" />
              Healthy liquidity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statement">Balance Sheet</TabsTrigger>
          <TabsTrigger value="analysis">Financial Analysis</TabsTrigger>
          <TabsTrigger value="ratios">Key Ratios</TabsTrigger>
        </TabsList>

        {/* Balance Sheet Tab */}
        <TabsContent value="statement" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Balance Sheet</CardTitle>
                <CardDescription>
                  As of {balanceSheetData.period} • All amounts in {balanceSheetData.currency}
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
                {/* Assets Section */}
                <div>
                  <BalanceSheetLine
                    label="ASSETS"
                    amount={balanceSheetData.assets.totalAssets}
                    bold={true}
                  />

                  {/* Current Assets */}
                  <BalanceSheetLine
                    label="Current Assets"
                    amount={balanceSheetData.assets.currentAssets.total}
                    level={1}
                    bold={true}
                  />
                  <BalanceSheetLine
                    label="Cash and Cash Equivalents"
                    amount={balanceSheetData.assets.currentAssets.cash}
                    level={2}
                    trend="up"
                    percentage={8.5}
                  />
                  <BalanceSheetLine
                    label="Accounts Receivable"
                    amount={balanceSheetData.assets.currentAssets.accountsReceivable}
                    level={2}
                    trend="up"
                    percentage={3.2}
                  />
                  <BalanceSheetLine
                    label="Inventory"
                    amount={balanceSheetData.assets.currentAssets.inventory}
                    level={2}
                    trend="down"
                    percentage={-2.1}
                  />
                  <BalanceSheetLine
                    label="Prepaid Expenses"
                    amount={balanceSheetData.assets.currentAssets.prepaidExpenses}
                    level={2}
                  />

                  {/* Non-Current Assets */}
                  <BalanceSheetLine
                    label="Non-Current Assets"
                    amount={balanceSheetData.assets.nonCurrentAssets.total}
                    level={1}
                    bold={true}
                  />
                  <BalanceSheetLine
                    label="Property, Plant & Equipment"
                    amount={balanceSheetData.assets.nonCurrentAssets.propertyPlantEquipment}
                    level={2}
                    trend="up"
                    percentage={15.7}
                  />
                  <BalanceSheetLine
                    label="Intangible Assets"
                    amount={balanceSheetData.assets.nonCurrentAssets.intangibleAssets}
                    level={2}
                  />
                  <BalanceSheetLine
                    label="Investments"
                    amount={balanceSheetData.assets.nonCurrentAssets.investments}
                    level={2}
                    trend="up"
                    percentage={22.4}
                  />
                </div>

                {/* Liabilities Section */}
                <div>
                  <BalanceSheetLine
                    label="LIABILITIES"
                    amount={balanceSheetData.liabilities.totalLiabilities}
                    bold={true}
                  />

                  {/* Current Liabilities */}
                  <BalanceSheetLine
                    label="Current Liabilities"
                    amount={balanceSheetData.liabilities.currentLiabilities.total}
                    level={1}
                    bold={true}
                  />
                  <BalanceSheetLine
                    label="Accounts Payable"
                    amount={balanceSheetData.liabilities.currentLiabilities.accountsPayable}
                    level={2}
                    trend="down"
                    percentage={-5.3}
                  />
                  <BalanceSheetLine
                    label="Short-term Debt"
                    amount={balanceSheetData.liabilities.currentLiabilities.shortTermDebt}
                    level={2}
                  />
                  <BalanceSheetLine
                    label="Accrued Expenses"
                    amount={balanceSheetData.liabilities.currentLiabilities.accruedExpenses}
                    level={2}
                  />

                  {/* Non-Current Liabilities */}
                  <BalanceSheetLine
                    label="Non-Current Liabilities"
                    amount={balanceSheetData.liabilities.nonCurrentLiabilities.total}
                    level={1}
                    bold={true}
                  />
                  <BalanceSheetLine
                    label="Long-term Debt"
                    amount={balanceSheetData.liabilities.nonCurrentLiabilities.longTermDebt}
                    level={2}
                    trend="up"
                    percentage={7.8}
                  />
                  <BalanceSheetLine
                    label="Deferred Tax Liabilities"
                    amount={balanceSheetData.liabilities.nonCurrentLiabilities.deferredTaxLiabilities}
                    level={2}
                  />
                </div>

                {/* Equity Section */}
                <div>
                  <BalanceSheetLine
                    label="SHAREHOLDERS' EQUITY"
                    amount={balanceSheetData.equity.totalEquity}
                    bold={true}
                  />
                  <BalanceSheetLine
                    label="Paid-in Capital"
                    amount={balanceSheetData.equity.paidInCapital}
                    level={1}
                  />
                  <BalanceSheetLine
                    label="Retained Earnings"
                    amount={balanceSheetData.equity.retainedEarnings}
                    level={1}
                    trend="up"
                    percentage={25.6}
                  />
                </div>

                {/* Total Check */}
                <div className="border-t-2 border-gray-900 pt-2">
                  <BalanceSheetLine
                    label="TOTAL LIABILITIES & EQUITY"
                    amount={balanceSheetData.liabilities.totalLiabilities + balanceSheetData.equity.totalEquity}
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
                <CardTitle>Liquidity Analysis</CardTitle>
                <CardDescription>Current financial liquidity position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Working Capital:</span>
                  <span className="font-semibold">${ratios.workingCapital.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Ratio:</span>
                  <Badge variant="outline" className="text-green-700 border-green-700">
                    {ratios.currentRatio}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600">
                  Current ratio above 2.0 indicates strong liquidity position for meeting short-term obligations.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leverage Analysis</CardTitle>
                <CardDescription>Debt and equity structure</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Debt-to-Equity Ratio:</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-700">
                    {ratios.debtToEquity}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Equity Percentage:</span>
                  <span className="font-semibold">
                    {((balanceSheetData.equity.totalEquity / balanceSheetData.assets.totalAssets) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  Conservative leverage structure with strong equity foundation.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Ratios Tab */}
        <TabsContent value="ratios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Ratios</CardTitle>
              <CardDescription>Key financial performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{ratios.currentRatio}</div>
                  <div className="text-sm text-gray-600">Current Ratio</div>
                  <div className="text-xs text-green-600 mt-1">Excellent</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{ratios.debtToEquity}</div>
                  <div className="text-sm text-gray-600">Debt-to-Equity</div>
                  <div className="text-xs text-green-600 mt-1">Conservative</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{ratios.assetTurnover}</div>
                  <div className="text-sm text-gray-600">Asset Turnover</div>
                  <div className="text-xs text-blue-600 mt-1">Good</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ${(ratios.workingCapital / 1000).toFixed(0)}K
                  </div>
                  <div className="text-sm text-gray-600">Working Capital</div>
                  <div className="text-xs text-green-600 mt-1">Strong</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
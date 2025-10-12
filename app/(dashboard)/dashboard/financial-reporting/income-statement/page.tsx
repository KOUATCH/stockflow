"use client";

// =============================================================================
// INCOME STATEMENT PAGE
// Dedicated page for income statement generation and analysis
// =============================================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CalendarIcon,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Shield
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { useFinancialNotifications } from '@/lib/financial-reporting/notifications/financial-notification-service';
import { useReportExport } from '@/hooks/useReportExport';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockIncomeStatementData = {
  reportingPeriod: {
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-03-31'),
    periodName: 'Q1 2024'
  },
  revenue: {
    grossRevenue: 2456789,
    salesReturns: 45623,
    salesAllowances: 12345,
    netRevenue: 2398821
  },
  costOfGoodsSold: {
    beginningInventory: 234567,
    purchases: 1456789,
    directLabor: 123456,
    manufacturingOverhead: 89012,
    endingInventory: 298765,
    totalCOGS: 1605059
  },
  grossProfit: 793762,
  operatingExpenses: {
    salariesAndWages: 245678,
    rent: 45000,
    utilities: 12345,
    insurance: 8900,
    depreciation: 23456,
    marketing: 34567,
    generalAndAdministrative: 67890,
    totalOperatingExpenses: 437836
  },
  operatingIncome: 355926,
  nonOperatingItems: {
    interestIncome: 5678,
    interestExpense: 12345,
    otherIncome: 2345,
    otherExpenses: 1234,
    netNonOperating: -5556
  },
  incomeBeforeTaxes: 350370,
  incomeTaxes: 87593,
  netIncome: 262777,
  earningsPerShare: {
    basic: 2.63,
    diluted: 2.61
  },
  margins: {
    grossMargin: 33.1,
    operatingMargin: 14.8,
    netMargin: 11.0
  }
};

// =============================================================================
// COMPONENTS
// =============================================================================

interface IncomeStatementLineProps {
  label: string;
  amount: number;
  level?: number;
  bold?: boolean;
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

const IncomeStatementLine: React.FC<IncomeStatementLineProps> = ({
  label,
  amount,
  level = 0,
  bold = false,
  trend
}) => {
  const indentation = level * 20;

  return (
    <div className={cn(
      "flex items-center justify-between py-2 border-b border-gray-100",
      bold && "font-semibold bg-gray-50"
    )}>
      <div className="flex items-center">
        <span
          style={{ marginLeft: `${indentation}px` }}
          className={cn(bold ? "text-gray-900" : "text-gray-700")}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {trend && (
          <div className="flex items-center gap-1 text-xs">
            {trend.type === 'increase' ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={trend.type === 'increase' ? 'text-green-600' : 'text-red-600'}>
              {formatPercentage(trend.value)}
            </span>
          </div>
        )}
        <span className={cn(
          "text-right min-w-[120px]",
          bold ? "font-bold text-gray-900" : "text-gray-700"
        )}>
          {formatCurrency(amount)}
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function IncomeStatementPage() {
  const { user } = useAuth();
  const notifications = useFinancialNotifications();
  const {
    isExporting,
    exportIncomeStatement,
    saveToDocuments,
    canSaveToDocuments
  } = useReportExport({
    onSuccess: (filename) => notifications.reportExported('Income Statement', filename),
    onError: (error) => notifications.error('Export Failed', error.message),
    defaultSaveLocation: 'documents'
  });

  const [dateRange, setDateRange] = useState({
    from: startOfMonth(subMonths(new Date(), 3)),
    to: endOfMonth(subMonths(new Date(), 1))
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(mockIncomeStatementData);
  const [activeTab, setActiveTab] = useState('statement');

  const handleGenerateStatement = async () => {
    setLoading(true);
    notifications.operationStart('Generating Income Statement');

    try {
      // Simulate API call
      setTimeout(() => {
        setData(mockIncomeStatementData);
        setLoading(false);
        notifications.statementGenerated('income', format(dateRange.from, 'MMM yyyy'));
      }, 2000);
    } catch (error) {
      setLoading(false);
      notifications.dataLoadError('Income Statement', 'Failed to generate statement');
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' = 'pdf') => {
    const incomeData = [
      { Category: 'Revenue', Item: 'Gross Revenue', Amount: data.revenue.grossRevenue },
      { Category: 'Revenue', Item: 'Sales Returns', Amount: -data.revenue.salesReturns },
      { Category: 'Revenue', Item: 'Sales Allowances', Amount: -data.revenue.salesAllowances },
      { Category: 'Revenue', Item: 'Net Revenue', Amount: data.revenue.netRevenue },
      { Category: 'Cost of Goods Sold', Item: 'Beginning Inventory', Amount: data.costOfGoodsSold.beginningInventory },
      { Category: 'Cost of Goods Sold', Item: 'Purchases', Amount: data.costOfGoodsSold.purchases },
      { Category: 'Cost of Goods Sold', Item: 'Direct Labor', Amount: data.costOfGoodsSold.directLabor },
      { Category: 'Cost of Goods Sold', Item: 'Manufacturing Overhead', Amount: data.costOfGoodsSold.manufacturingOverhead },
      { Category: 'Cost of Goods Sold', Item: 'Ending Inventory', Amount: -data.costOfGoodsSold.endingInventory },
      { Category: 'Cost of Goods Sold', Item: 'Total COGS', Amount: data.costOfGoodsSold.totalCOGS },
      { Category: 'Operating Expenses', Item: 'Salaries and Wages', Amount: data.operatingExpenses.salariesWages },
      { Category: 'Operating Expenses', Item: 'Rent Expense', Amount: data.operatingExpenses.rentExpense },
      { Category: 'Operating Expenses', Item: 'Utilities', Amount: data.operatingExpenses.utilities },
      { Category: 'Operating Expenses', Item: 'Marketing', Amount: data.operatingExpenses.marketing },
      { Category: 'Operating Expenses', Item: 'Insurance', Amount: data.operatingExpenses.insurance },
      { Category: 'Operating Expenses', Item: 'Depreciation', Amount: data.operatingExpenses.depreciation },
      { Category: 'Operating Expenses', Item: 'Total Operating Expenses', Amount: data.operatingExpenses.totalOperatingExpenses },
      { Category: 'Summary', Item: 'Gross Profit', Amount: data.calculations.grossProfit },
      { Category: 'Summary', Item: 'Operating Income', Amount: data.calculations.operatingIncome },
      { Category: 'Summary', Item: 'Net Income', Amount: data.calculations.netIncome }
    ];

    const periodName = format(dateRange.from, 'MMM yyyy') + ' - ' + format(dateRange.to, 'MMM yyyy');

    await exportIncomeStatement(incomeData, periodName, format);
  };

  const handleSaveToDocuments = async (format: 'pdf' | 'excel' = 'pdf') => {
    const incomeData = [
      { Category: 'Revenue', Item: 'Gross Revenue', Amount: data.revenue.grossRevenue },
      { Category: 'Revenue', Item: 'Net Revenue', Amount: data.revenue.netRevenue },
      { Category: 'Cost of Goods Sold', Item: 'Total COGS', Amount: data.costOfGoodsSold.totalCOGS },
      { Category: 'Operating Expenses', Item: 'Total Operating Expenses', Amount: data.operatingExpenses.totalOperatingExpenses },
      { Category: 'Summary', Item: 'Gross Profit', Amount: data.calculations.grossProfit },
      { Category: 'Summary', Item: 'Operating Income', Amount: data.calculations.operatingIncome },
      { Category: 'Summary', Item: 'Net Income', Amount: data.calculations.netIncome }
    ];

    const periodName = format(dateRange.from, 'MMM yyyy') + ' - ' + format(dateRange.to, 'MMM yyyy');
    const title = `Income Statement - ${periodName}`;

    await saveToDocuments(incomeData, title, periodName, format);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Income Statement</h1>
            <Badge variant="outline" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              P&L Statement
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Profit and loss statement for {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('excel')}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>

            {canSaveToDocuments() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveToDocuments('pdf')}
                disabled={isExporting}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Save to Documents
              </Button>
            )}
          </div>

          <Button size="sm" onClick={handleGenerateStatement} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4 mr-2" />
            )}
            Generate
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => range && setDateRange(range)}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.revenue.netRevenue)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last period
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.grossProfit)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {formatPercentage(data.margins.grossMargin)} margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operating Income</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.operatingIncome)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {formatPercentage(data.margins.operatingMargin)} margin
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.netIncome)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              {formatPercentage(data.margins.netMargin)} margin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="statement">Income Statement</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="statement" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Income Statement - {data.reportingPeriod.periodName}
              </CardTitle>
              <CardDescription>
                Detailed profit and loss statement showing revenue, expenses, and net income
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Revenue Section */}
              <div className="space-y-2">
                <IncomeStatementLine
                  label="REVENUE"
                  amount={0}
                  bold
                />
                <IncomeStatementLine
                  label="Gross Revenue"
                  amount={data.revenue.grossRevenue}
                  level={1}
                  trend={{ value: 12.5, type: 'increase' }}
                />
                <IncomeStatementLine
                  label="Less: Sales Returns"
                  amount={-data.revenue.salesReturns}
                  level={1}
                />
                <IncomeStatementLine
                  label="Less: Sales Allowances"
                  amount={-data.revenue.salesAllowances}
                  level={1}
                />
                <IncomeStatementLine
                  label="Net Revenue"
                  amount={data.revenue.netRevenue}
                  bold
                  trend={{ value: 10.8, type: 'increase' }}
                />
              </div>

              <Separator />

              {/* Cost of Goods Sold */}
              <div className="space-y-2">
                <IncomeStatementLine
                  label="COST OF GOODS SOLD"
                  amount={0}
                  bold
                />
                <IncomeStatementLine
                  label="Beginning Inventory"
                  amount={data.costOfGoodsSold.beginningInventory}
                  level={1}
                />
                <IncomeStatementLine
                  label="Purchases"
                  amount={data.costOfGoodsSold.purchases}
                  level={1}
                />
                <IncomeStatementLine
                  label="Direct Labor"
                  amount={data.costOfGoodsSold.directLabor}
                  level={1}
                />
                <IncomeStatementLine
                  label="Manufacturing Overhead"
                  amount={data.costOfGoodsSold.manufacturingOverhead}
                  level={1}
                />
                <IncomeStatementLine
                  label="Less: Ending Inventory"
                  amount={-data.costOfGoodsSold.endingInventory}
                  level={1}
                />
                <IncomeStatementLine
                  label="Total Cost of Goods Sold"
                  amount={data.costOfGoodsSold.totalCOGS}
                  bold
                  trend={{ value: 8.2, type: 'increase' }}
                />
              </div>

              <Separator />

              {/* Gross Profit */}
              <IncomeStatementLine
                label="GROSS PROFIT"
                amount={data.grossProfit}
                bold
                trend={{ value: 15.3, type: 'increase' }}
              />

              <Separator />

              {/* Operating Expenses */}
              <div className="space-y-2">
                <IncomeStatementLine
                  label="OPERATING EXPENSES"
                  amount={0}
                  bold
                />
                <IncomeStatementLine
                  label="Salaries and Wages"
                  amount={data.operatingExpenses.salariesAndWages}
                  level={1}
                />
                <IncomeStatementLine
                  label="Rent"
                  amount={data.operatingExpenses.rent}
                  level={1}
                />
                <IncomeStatementLine
                  label="Utilities"
                  amount={data.operatingExpenses.utilities}
                  level={1}
                />
                <IncomeStatementLine
                  label="Insurance"
                  amount={data.operatingExpenses.insurance}
                  level={1}
                />
                <IncomeStatementLine
                  label="Depreciation"
                  amount={data.operatingExpenses.depreciation}
                  level={1}
                />
                <IncomeStatementLine
                  label="Marketing"
                  amount={data.operatingExpenses.marketing}
                  level={1}
                />
                <IncomeStatementLine
                  label="General & Administrative"
                  amount={data.operatingExpenses.generalAndAdministrative}
                  level={1}
                />
                <IncomeStatementLine
                  label="Total Operating Expenses"
                  amount={data.operatingExpenses.totalOperatingExpenses}
                  bold
                  trend={{ value: 5.7, type: 'increase' }}
                />
              </div>

              <Separator />

              {/* Operating Income */}
              <IncomeStatementLine
                label="OPERATING INCOME"
                amount={data.operatingIncome}
                bold
                trend={{ value: 18.2, type: 'increase' }}
              />

              <Separator />

              {/* Non-Operating Items */}
              <div className="space-y-2">
                <IncomeStatementLine
                  label="OTHER INCOME (EXPENSE)"
                  amount={0}
                  bold
                />
                <IncomeStatementLine
                  label="Interest Income"
                  amount={data.nonOperatingItems.interestIncome}
                  level={1}
                />
                <IncomeStatementLine
                  label="Interest Expense"
                  amount={-data.nonOperatingItems.interestExpense}
                  level={1}
                />
                <IncomeStatementLine
                  label="Other Income"
                  amount={data.nonOperatingItems.otherIncome}
                  level={1}
                />
                <IncomeStatementLine
                  label="Other Expenses"
                  amount={-data.nonOperatingItems.otherExpenses}
                  level={1}
                />
                <IncomeStatementLine
                  label="Net Other Income (Expense)"
                  amount={data.nonOperatingItems.netNonOperating}
                  bold
                />
              </div>

              <Separator />

              {/* Final Results */}
              <IncomeStatementLine
                label="INCOME BEFORE TAXES"
                amount={data.incomeBeforeTaxes}
                bold
                trend={{ value: 17.8, type: 'increase' }}
              />

              <IncomeStatementLine
                label="Income Tax Expense"
                amount={data.incomeTaxes}
                level={0}
              />

              <Separator className="border-2" />

              <IncomeStatementLine
                label="NET INCOME"
                amount={data.netIncome}
                bold
                trend={{ value: 22.1, type: 'increase' }}
              />

              <Separator />

              {/* Earnings Per Share */}
              <div className="space-y-2">
                <IncomeStatementLine
                  label="EARNINGS PER SHARE"
                  amount={0}
                  bold
                />
                <IncomeStatementLine
                  label="Basic EPS"
                  amount={data.earningsPerShare.basic}
                  level={1}
                />
                <IncomeStatementLine
                  label="Diluted EPS"
                  amount={data.earningsPerShare.diluted}
                  level={1}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6 mt-6">
          <Alert>
            <BarChart3 className="h-4 w-4" />
            <AlertDescription>
              Financial analysis tools including margin analysis, trend analysis, and ratio calculations will be displayed here.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6 mt-6">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Period-over-period comparison and budget vs. actual analysis will be displayed here.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
}
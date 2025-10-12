"use client";

// =============================================================================
// FINANCIAL ANALYSIS PAGE
// Comprehensive financial analysis with ratios, trends, and insights
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Shield,
  AlertTriangle,
  Target,
  Activity,
  DollarSign,
  Percent,
  Calculator,
  BookOpen,
  Building,
  Users
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockFinancialData = {
  currentPeriod: "Q4 2024",
  previousPeriod: "Q3 2024",

  // Liquidity Ratios
  liquidityRatios: {
    currentRatio: { current: 3.21, previous: 2.85, benchmark: 2.0, status: 'excellent' },
    quickRatio: { current: 2.45, previous: 2.12, benchmark: 1.0, status: 'excellent' },
    cashRatio: { current: 0.86, previous: 0.75, benchmark: 0.2, status: 'excellent' },
    workingCapital: { current: 320000, previous: 280000, benchmark: 200000, status: 'good' }
  },

  // Profitability Ratios
  profitabilityRatios: {
    grossProfitMargin: { current: 0.40, previous: 0.38, benchmark: 0.35, status: 'excellent' },
    netProfitMargin: { current: 0.195, previous: 0.18, benchmark: 0.15, status: 'excellent' },
    operatingMargin: { current: 0.22, previous: 0.20, benchmark: 0.18, status: 'excellent' },
    returnOnAssets: { current: 0.171, previous: 0.155, benchmark: 0.12, status: 'excellent' },
    returnOnEquity: { current: 0.267, previous: 0.240, benchmark: 0.20, status: 'excellent' }
  },

  // Efficiency Ratios
  efficiencyRatios: {
    assetTurnover: { current: 0.878, previous: 0.861, benchmark: 0.75, status: 'good' },
    inventoryTurnover: { current: 4.5, previous: 4.2, benchmark: 4.0, status: 'good' },
    receivablesTurnover: { current: 12.8, previous: 11.5, benchmark: 10.0, status: 'excellent' },
    payablesTurnover: { current: 8.2, previous: 7.8, benchmark: 6.0, status: 'excellent' }
  },

  // Leverage Ratios
  leverageRatios: {
    debtToEquity: { current: 0.562, previous: 0.610, benchmark: 0.60, status: 'good' },
    debtToAssets: { current: 0.360, previous: 0.378, benchmark: 0.40, status: 'good' },
    equityRatio: { current: 0.640, previous: 0.622, benchmark: 0.60, status: 'excellent' },
    interestCoverage: { current: 15.2, previous: 13.8, benchmark: 5.0, status: 'excellent' }
  },

  // Trend Analysis
  trends: {
    revenue: [980000, 1050000, 1180000, 1435000, 1250000],
    netIncome: [156800, 189000, 212400, 279825, 243750],
    totalAssets: [1420000, 1485000, 1560000, 1635000, 1640000],
    periods: ['Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']
  },

  // Industry Benchmarks
  industryBenchmarks: {
    currentRatio: 2.1,
    quickRatio: 1.3,
    grossMargin: 0.35,
    netMargin: 0.15,
    roe: 0.18,
    debtToEquity: 0.65
  }
};

interface RatioData {
  current: number;
  previous: number;
  benchmark: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
}

interface RatioCardProps {
  title: string;
  data: RatioData;
  format: 'ratio' | 'percentage' | 'currency' | 'times';
  icon: React.ElementType;
}

const RatioCard: React.FC<RatioCardProps> = ({ title, data, format, icon: Icon }) => {
  const formatValue = (value: number) => {
    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
        }).format(value);
      case 'times':
        return `${value.toFixed(1)}x`;
      default:
        return value.toFixed(2);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const change = ((data.current - data.previous) / data.previous) * 100;
  const isPositive = change > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(data.current)}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center text-xs">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
          <Badge variant="outline" className={getStatusColor(data.status)}>
            {data.status}
          </Badge>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Benchmark: {formatValue(data.benchmark)}
        </div>
      </CardContent>
    </Card>
  );
};

export default function FinancialAnalysisPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState(mockFinancialData);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('Q4 2024');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadFinancialAnalysis = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setFinancialData(mockFinancialData);
      } catch (error) {
        console.error('Failed to load financial analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFinancialAnalysis();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting financial analysis as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const calculateOverallScore = () => {
    const ratios = [
      ...Object.values(financialData.liquidityRatios),
      ...Object.values(financialData.profitabilityRatios),
      ...Object.values(financialData.efficiencyRatios),
      ...Object.values(financialData.leverageRatios)
    ];

    const scores = ratios.map(ratio => {
      switch (ratio.status) {
        case 'excellent': return 4;
        case 'good': return 3;
        case 'fair': return 2;
        case 'poor': return 1;
        default: return 0;
      }
    });

    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(avgScore * 25); // Convert to percentage
  };

  const overallScore = calculateOverallScore();

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
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
            Please log in to access financial analysis.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Analysis</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive financial ratios, trends, and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Q4 2024">Q4 2024</SelectItem>
              <SelectItem value="Q3 2024">Q3 2024</SelectItem>
              <SelectItem value="Q2 2024">Q2 2024</SelectItem>
              <SelectItem value="Q1 2024">Q1 2024</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallScore}%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Excellent performance
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Ratio</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.liquidityRatios.currentRatio.current.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Strong liquidity
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROE</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(financialData.profitabilityRatios.returnOnEquity.current * 100).toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Above benchmark
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Debt-to-Equity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialData.leverageRatios.debtToEquity.current.toFixed(2)}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              Improving leverage
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="profitability">Profitability</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="leverage">Leverage</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Health Score</CardTitle>
                <CardDescription>Overall financial performance assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Liquidity</span>
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Profitability</span>
                    <Badge className="bg-green-100 text-green-700">Excellent</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Efficiency</span>
                    <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Leverage</span>
                    <Badge className="bg-blue-100 text-blue-700">Good</Badge>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Strong Financial Position</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Your company demonstrates excellent financial health with strong liquidity,
                    profitability above industry benchmarks, and conservative leverage.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Trends</CardTitle>
                <CardDescription>Financial performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Revenue Growth</span>
                      <span className="text-sm text-green-600 font-semibold">+15.3%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="text-sm text-green-600 font-semibold">+1.5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Asset Efficiency</span>
                      <span className="text-sm text-blue-600 font-semibold">+2.0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Debt Reduction</span>
                      <span className="text-sm text-green-600 font-semibold">-7.9%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Industry Comparison</CardTitle>
              <CardDescription>How your metrics compare to industry benchmarks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {financialData.liquidityRatios.currentRatio.current.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Current Ratio</div>
                  <div className="text-xs text-green-600 mt-1">
                    vs Industry: {financialData.industryBenchmarks.currentRatio}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(financialData.profitabilityRatios.grossProfitMargin.current * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Gross Margin</div>
                  <div className="text-xs text-green-600 mt-1">
                    vs Industry: {(financialData.industryBenchmarks.grossMargin * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(financialData.profitabilityRatios.returnOnEquity.current * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Return on Equity</div>
                  <div className="text-xs text-green-600 mt-1">
                    vs Industry: {(financialData.industryBenchmarks.roe * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Liquidity Tab */}
        <TabsContent value="liquidity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RatioCard
              title="Current Ratio"
              data={financialData.liquidityRatios.currentRatio}
              format="ratio"
              icon={Activity}
            />
            <RatioCard
              title="Quick Ratio"
              data={financialData.liquidityRatios.quickRatio}
              format="ratio"
              icon={Target}
            />
            <RatioCard
              title="Cash Ratio"
              data={financialData.liquidityRatios.cashRatio}
              format="ratio"
              icon={DollarSign}
            />
            <RatioCard
              title="Working Capital"
              data={financialData.liquidityRatios.workingCapital}
              format="currency"
              icon={Building}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liquidity Analysis</CardTitle>
              <CardDescription>Assessment of your company's ability to meet short-term obligations</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Excellent Liquidity Position:</strong> Your current ratio of 3.21 indicates strong ability
                  to cover short-term debts. The quick ratio of 2.45 shows excellent liquidity even without inventory.
                  Working capital has increased by 14.3% quarter-over-quarter, demonstrating improving operational efficiency.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <RatioCard
              title="Gross Profit Margin"
              data={financialData.profitabilityRatios.grossProfitMargin}
              format="percentage"
              icon={BarChart3}
            />
            <RatioCard
              title="Net Profit Margin"
              data={financialData.profitabilityRatios.netProfitMargin}
              format="percentage"
              icon={Target}
            />
            <RatioCard
              title="Operating Margin"
              data={financialData.profitabilityRatios.operatingMargin}
              format="percentage"
              icon={Activity}
            />
            <RatioCard
              title="Return on Assets"
              data={financialData.profitabilityRatios.returnOnAssets}
              format="percentage"
              icon={Building}
            />
            <RatioCard
              title="Return on Equity"
              data={financialData.profitabilityRatios.returnOnEquity}
              format="percentage"
              icon={Users}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
              <CardDescription>Analysis of your company's ability to generate profit</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  <strong>Outstanding Profitability:</strong> Net profit margin of 19.5% significantly exceeds
                  industry benchmark of 15%. ROE of 26.7% indicates excellent returns for shareholders.
                  All profitability metrics show positive trends compared to previous quarter.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Efficiency Tab */}
        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RatioCard
              title="Asset Turnover"
              data={financialData.efficiencyRatios.assetTurnover}
              format="times"
              icon={Building}
            />
            <RatioCard
              title="Inventory Turnover"
              data={financialData.efficiencyRatios.inventoryTurnover}
              format="times"
              icon={BarChart3}
            />
            <RatioCard
              title="Receivables Turnover"
              data={financialData.efficiencyRatios.receivablesTurnover}
              format="times"
              icon={Users}
            />
            <RatioCard
              title="Payables Turnover"
              data={financialData.efficiencyRatios.payablesTurnover}
              format="times"
              icon={Calculator}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Efficiency Analysis</CardTitle>
              <CardDescription>How effectively your company uses its assets and manages operations</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Good Operational Efficiency:</strong> Receivables turnover of 12.8x indicates excellent
                  collection efficiency. Inventory turnover of 4.5x shows good inventory management.
                  Asset turnover has improved, demonstrating better utilization of company assets.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leverage Tab */}
        <TabsContent value="leverage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <RatioCard
              title="Debt-to-Equity"
              data={financialData.leverageRatios.debtToEquity}
              format="ratio"
              icon={BarChart3}
            />
            <RatioCard
              title="Debt-to-Assets"
              data={financialData.leverageRatios.debtToAssets}
              format="ratio"
              icon={Building}
            />
            <RatioCard
              title="Equity Ratio"
              data={financialData.leverageRatios.equityRatio}
              format="ratio"
              icon={PieChart}
            />
            <RatioCard
              title="Interest Coverage"
              data={financialData.leverageRatios.interestCoverage}
              format="times"
              icon={Shield}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leverage Analysis</CardTitle>
              <CardDescription>Assessment of your company's debt levels and financial risk</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Conservative Leverage Strategy:</strong> Debt-to-equity ratio of 0.56 is below industry
                  benchmark, indicating conservative debt management. Interest coverage of 15.2x provides excellent
                  cushion for debt service. Equity ratio of 64% shows strong financial stability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
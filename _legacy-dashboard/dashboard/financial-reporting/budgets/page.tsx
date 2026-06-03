"use client";

// =============================================================================
// BUDGET MANAGEMENT PAGE
// Comprehensive budget planning, tracking, and variance analysis
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Edit,
  MoreHorizontal,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Shield,
  AlertTriangle,
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockBudgets = [
  {
    id: "1",
    name: "2025 Annual Operating Budget",
    period: "2025",
    type: "Operating",
    status: "approved",
    totalBudget: 2850000,
    totalActual: 0,
    totalVariance: 0,
    createdBy: "John Doe",
    approvedBy: "Jane Smith",
    createdDate: "2024-11-15",
    approvedDate: "2024-12-01",
    categories: [
      {
        id: "rev1",
        name: "Sales Revenue",
        type: "Revenue",
        budgeted: 3500000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "exp1",
        name: "Cost of Goods Sold",
        type: "Expense",
        budgeted: 2100000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "exp2",
        name: "Salaries & Benefits",
        type: "Expense",
        budgeted: 850000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "exp3",
        name: "Marketing & Advertising",
        type: "Expense",
        budgeted: 180000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "exp4",
        name: "Operating Expenses",
        type: "Expense",
        budgeted: 220000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      }
    ]
  },
  {
    id: "2",
    name: "Q4 2024 Marketing Budget",
    period: "Q4 2024",
    type: "Departmental",
    status: "active",
    totalBudget: 150000,
    totalActual: 127500,
    totalVariance: -22500,
    createdBy: "Sarah Wilson",
    approvedBy: "John Doe",
    createdDate: "2024-09-15",
    approvedDate: "2024-09-20",
    categories: [
      {
        id: "mkt1",
        name: "Digital Advertising",
        type: "Expense",
        budgeted: 75000,
        actual: 68500,
        variance: -6500,
        variancePercent: -8.7
      },
      {
        id: "mkt2",
        name: "Content Creation",
        type: "Expense",
        budgeted: 35000,
        actual: 31200,
        variance: -3800,
        variancePercent: -10.9
      },
      {
        id: "mkt3",
        name: "Events & Trade Shows",
        type: "Expense",
        budgeted: 25000,
        actual: 18500,
        variance: -6500,
        variancePercent: -26.0
      },
      {
        id: "mkt4",
        name: "Marketing Software",
        type: "Expense",
        budgeted: 15000,
        actual: 9300,
        variance: -5700,
        variancePercent: -38.0
      }
    ]
  },
  {
    id: "3",
    name: "Q1 2025 Capital Expenditure Budget",
    period: "Q1 2025",
    type: "Capital",
    status: "pending_approval",
    totalBudget: 485000,
    totalActual: 0,
    totalVariance: 0,
    createdBy: "Mike Johnson",
    approvedBy: null,
    createdDate: "2024-12-10",
    approvedDate: null,
    categories: [
      {
        id: "cap1",
        name: "IT Equipment",
        type: "Asset",
        budgeted: 125000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "cap2",
        name: "Warehouse Equipment",
        type: "Asset",
        budgeted: 200000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "cap3",
        name: "Office Renovation",
        type: "Asset",
        budgeted: 85000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      {
        id: "cap4",
        name: "Vehicle Fleet",
        type: "Asset",
        budgeted: 75000,
        actual: 0,
        variance: 0,
        variancePercent: 0
      }
    ]
  }
];

interface Budget {
  id: string;
  name: string;
  period: string;
  type: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed';
  totalBudget: number;
  totalActual: number;
  totalVariance: number;
  createdBy: string;
  approvedBy: string | null;
  createdDate: string;
  approvedDate: string | null;
  categories: BudgetCategory[];
}

interface BudgetCategory {
  id: string;
  name: string;
  type: 'Revenue' | 'Expense' | 'Asset';
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

export default function BudgetManagementPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [activeTab, setActiveTab] = useState('budgets');
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New budget state
  const [newBudget, setNewBudget] = useState({
    name: '',
    period: '',
    type: 'Operating',
    categories: [
      { name: '', type: 'Revenue', budgeted: 0 },
      { name: '', type: 'Expense', budgeted: 0 }
    ]
  });

  useEffect(() => {
    const loadBudgets = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setBudgets(mockBudgets);
      } catch (error) {
        console.error('Failed to load budgets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBudgets();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting budgets as ${format}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Edit },
      pending_approval: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: AlertCircle },
      approved: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
      active: { color: 'bg-green-100 text-green-700 border-green-300', icon: Activity },
      closed: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getVarianceBadge = (variance: number, isPercentage: boolean = false) => {
    if (variance === 0) {
      return <Badge variant="outline">On Target</Badge>;
    }

    const isPositive = variance > 0;
    const value = isPercentage ? `${Math.abs(variance).toFixed(1)}%` : formatCurrency(Math.abs(variance));

    return (
      <Badge
        variant="outline"
        className={isPositive ? 'text-green-700 border-green-300 bg-green-50' : 'text-red-700 border-red-300 bg-red-50'}
      >
        {isPositive ? '+' : '-'}{value}
      </Badge>
    );
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    const matchesType = typeFilter === 'all' || budget.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getBudgetSummary = () => {
    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.totalBudget, 0);
    const totalActual = budgets.reduce((sum, budget) => sum + budget.totalActual, 0);
    const totalVariance = budgets.reduce((sum, budget) => sum + budget.totalVariance, 0);

    return {
      totalBudgeted,
      totalActual,
      totalVariance,
      variancePercent: totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0
    };
  };

  const budgetSummary = getBudgetSummary();

  const addBudgetCategory = () => {
    setNewBudget(prev => ({
      ...prev,
      categories: [...prev.categories, { name: '', type: 'Expense', budgeted: 0 }]
    }));
  };

  const removeBudgetCategory = (index: number) => {
    if (newBudget.categories.length > 1) {
      setNewBudget(prev => ({
        ...prev,
        categories: prev.categories.filter((_, i) => i !== index)
      }));
    }
  };

  const updateBudgetCategory = (index: number, field: string, value: any) => {
    setNewBudget(prev => ({
      ...prev,
      categories: prev.categories.map((category, i) =>
        i === index ? { ...category, [field]: value } : category
      )
    }));
  };

  const handleCreateBudget = async () => {
    const totalBudget = newBudget.categories.reduce((sum, cat) => sum + (cat.budgeted || 0), 0);

    const budget: Budget = {
      id: String(budgets.length + 1),
      name: newBudget.name,
      period: newBudget.period,
      type: newBudget.type,
      status: 'draft',
      totalBudget,
      totalActual: 0,
      totalVariance: 0,
      createdBy: user?.name || 'Current User',
      approvedBy: null,
      createdDate: new Date().toISOString().split('T')[0],
      approvedDate: null,
      categories: newBudget.categories.map((cat, index) => ({
        id: `cat_${index}`,
        name: cat.name,
        type: cat.type as 'Revenue' | 'Expense' | 'Asset',
        budgeted: cat.budgeted,
        actual: 0,
        variance: 0,
        variancePercent: 0
      }))
    };

    setBudgets(prev => [budget, ...prev]);
    setIsCreateDialogOpen(false);
    setNewBudget({
      name: '',
      period: '',
      type: 'Operating',
      categories: [
        { name: '', type: 'Revenue', budgeted: 0 },
        { name: '', type: 'Expense', budgeted: 0 }
      ]
    });
  };

  const handleApproveBudget = (budgetId: string) => {
    setBudgets(prev => prev.map(budget =>
      budget.id === budgetId
        ? {
            ...budget,
            status: 'approved',
            approvedBy: user?.name || 'Current User',
            approvedDate: new Date().toISOString().split('T')[0]
          }
        : budget
    ));
  };

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
            Please log in to access budget management.
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
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and track budgets with variance analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Budget
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budgetSummary.totalBudgeted)}</div>
            <div className="text-xs text-gray-600">All active budgets</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(budgetSummary.totalActual)}</div>
            <div className="text-xs text-gray-600">Year to date spending</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${budgetSummary.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(budgetSummary.totalVariance)}
            </div>
            <div className="flex items-center text-xs">
              {budgetSummary.totalVariance >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={budgetSummary.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(budgetSummary.variancePercent).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Budgets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.status === 'active' || b.status === 'approved').length}
            </div>
            <div className="text-xs text-gray-600">Currently tracking</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budgets">All Budgets</TabsTrigger>
          <TabsTrigger value="variance">Variance Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* All Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Budget Overview</CardTitle>
                  <CardDescription>All budgets and their current status</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Search budgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending_approval">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Operating">Operating</SelectItem>
                      <SelectItem value="Capital">Capital</SelectItem>
                      <SelectItem value="Departmental">Departmental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-semibold">{budget.name}</div>
                        <div className="text-sm text-gray-600">
                          {budget.period} • {budget.type} • Created by {budget.createdBy}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(budget.totalBudget)}</div>
                        <div className="text-sm text-gray-600">
                          {budget.totalActual > 0 && (
                            <>Actual: {formatCurrency(budget.totalActual)}</>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(budget.status)}
                        {budget.totalVariance !== 0 && getVarianceBadge(budget.totalVariance)}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedBudget(budget);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          {budget.status === 'pending_approval' && (
                            <DropdownMenuItem
                              onClick={() => handleApproveBudget(budget.id)}
                            >
                              Approve Budget
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Budget
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Analysis Tab */}
        <TabsContent value="variance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {budgets.filter(b => b.totalActual > 0).map((budget) => (
              <Card key={budget.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{budget.name}</CardTitle>
                  <CardDescription>{budget.period}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Budgeted:</span>
                        <div className="font-semibold">{formatCurrency(budget.totalBudget)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Actual:</span>
                        <div className="font-semibold">{formatCurrency(budget.totalActual)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Variance:</span>
                        <div className={`font-semibold ${budget.totalVariance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(budget.totalVariance)}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {budget.categories.slice(0, 3).map((category) => (
                        <div key={category.id} className="flex justify-between items-center text-sm">
                          <span>{category.name}</span>
                          {getVarianceBadge(category.variancePercent, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Performance Overview</CardTitle>
              <CardDescription>Summary of budget execution across all active budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Budget Status Distribution</h4>
                  <div className="space-y-3">
                    {['approved', 'active', 'pending_approval', 'draft'].map((status) => {
                      const count = budgets.filter(b => b.status === status).length;
                      const percentage = budgets.length > 0 ? (count / budgets.length) * 100 : 0;

                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusBadge(status)}
                            <span className="text-sm">{count} budgets</span>
                          </div>
                          <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Budget Types</h4>
                  <div className="space-y-3">
                    {['Operating', 'Capital', 'Departmental'].map((type) => {
                      const typeBudgets = budgets.filter(b => b.type === type);
                      const totalAmount = typeBudgets.reduce((sum, b) => sum + b.totalBudget, 0);

                      return (
                        <div key={type} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{type}</span>
                            <div className="text-sm text-gray-600">{typeBudgets.length} budgets</div>
                          </div>
                          <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Budget Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Set up a new budget with categories and amounts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Budget Name</label>
                <Input
                  placeholder="e.g., 2025 Marketing Budget"
                  value={newBudget.name}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Period</label>
                <Input
                  placeholder="e.g., Q1 2025"
                  value={newBudget.period}
                  onChange={(e) => setNewBudget(prev => ({ ...prev, period: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select
                  value={newBudget.type}
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operating">Operating</SelectItem>
                    <SelectItem value="Capital">Capital</SelectItem>
                    <SelectItem value="Departmental">Departmental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Budget Categories</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBudgetCategory}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {newBudget.categories.map((category, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-5">
                      <label className="text-xs font-medium">Category Name</label>
                      <Input
                        placeholder="Category name"
                        value={category.name}
                        onChange={(e) => updateBudgetCategory(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-medium">Type</label>
                      <Select
                        value={category.type}
                        onValueChange={(value) => updateBudgetCategory(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Revenue">Revenue</SelectItem>
                          <SelectItem value="Expense">Expense</SelectItem>
                          <SelectItem value="Asset">Asset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-medium">Budgeted Amount</label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={category.budgeted || ''}
                        onChange={(e) => updateBudgetCategory(index, 'budgeted', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      {newBudget.categories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBudgetCategory(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Budget:</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(newBudget.categories.reduce((sum, cat) => sum + (cat.budgeted || 0), 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBudget}
              disabled={!newBudget.name || !newBudget.period || newBudget.categories.length === 0}
            >
              Create Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Budget Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedBudget && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBudget.name}</DialogTitle>
                <DialogDescription>
                  Detailed budget breakdown and variance analysis
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Period</label>
                    <div>{selectedBudget.period}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <div>{selectedBudget.type}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div>{getStatusBadge(selectedBudget.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Budget</label>
                    <div className="font-semibold">{formatCurrency(selectedBudget.totalBudget)}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Budget Categories</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Category</th>
                          <th className="text-left p-3 font-medium">Type</th>
                          <th className="text-right p-3 font-medium">Budgeted</th>
                          <th className="text-right p-3 font-medium">Actual</th>
                          <th className="text-right p-3 font-medium">Variance</th>
                          <th className="text-right p-3 font-medium">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBudget.categories.map((category) => (
                          <tr key={category.id} className="border-b">
                            <td className="p-3 font-medium">{category.name}</td>
                            <td className="p-3">
                              <Badge variant="outline">{category.type}</Badge>
                            </td>
                            <td className="p-3 text-right">{formatCurrency(category.budgeted)}</td>
                            <td className="p-3 text-right">{formatCurrency(category.actual)}</td>
                            <td className="p-3 text-right">
                              <span className={category.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {formatCurrency(category.variance)}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {category.variancePercent !== 0 ? (
                                <span className={category.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {category.variancePercent.toFixed(1)}%
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                {selectedBudget.status === 'pending_approval' && (
                  <Button
                    onClick={() => {
                      handleApproveBudget(selectedBudget.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Budget
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

// =============================================================================
// CHART OF ACCOUNTS PAGE
// Complete account management with creation, editing, and categorization
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
  Trash2,
  MoreHorizontal,
  Download,
  Search,
  Filter,
  Eye,
  Shield,
  AlertTriangle,
  Building,
  CreditCard,
  DollarSign,
  FileText,
  PieChart,
  Users,
  Archive,
  CheckCircle
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockChartOfAccounts = [
  {
    id: "1",
    number: "1000",
    name: "Cash - Operating Account",
    type: "Asset",
    subType: "Current Asset",
    description: "Main operating cash account for daily transactions",
    balance: 125000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-15"
  },
  {
    id: "2",
    number: "1200",
    name: "Accounts Receivable",
    type: "Asset",
    subType: "Current Asset",
    description: "Outstanding customer invoices",
    balance: 85000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-15"
  },
  {
    id: "3",
    number: "1300",
    name: "Inventory",
    type: "Asset",
    subType: "Current Asset",
    description: "Product inventory at cost",
    balance: 240000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-14"
  },
  {
    id: "4",
    number: "1500",
    name: "Equipment",
    type: "Asset",
    subType: "Fixed Asset",
    description: "Office and warehouse equipment",
    balance: 150000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-01"
  },
  {
    id: "5",
    number: "1510",
    name: "Accumulated Depreciation - Equipment",
    type: "Asset",
    subType: "Fixed Asset",
    description: "Accumulated depreciation on equipment",
    balance: -45000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-13"
  },
  {
    id: "6",
    number: "2000",
    name: "Accounts Payable",
    type: "Liability",
    subType: "Current Liability",
    description: "Outstanding supplier invoices",
    balance: 65000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-14"
  },
  {
    id: "7",
    number: "2100",
    name: "Accrued Expenses",
    type: "Liability",
    subType: "Current Liability",
    description: "Accrued but unpaid expenses",
    balance: 35000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-10"
  },
  {
    id: "8",
    number: "2500",
    name: "Long-term Debt",
    type: "Liability",
    subType: "Long-term Liability",
    description: "Bank loans and long-term financing",
    balance: 400000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-01"
  },
  {
    id: "9",
    number: "3000",
    name: "Owner's Equity",
    type: "Equity",
    subType: "Owner's Equity",
    description: "Owner's capital investment",
    balance: 800000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-01-01"
  },
  {
    id: "10",
    number: "3100",
    name: "Retained Earnings",
    type: "Equity",
    subType: "Retained Earnings",
    description: "Accumulated earnings retained in business",
    balance: 250000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-31"
  },
  {
    id: "11",
    number: "4000",
    name: "Sales Revenue",
    type: "Revenue",
    subType: "Operating Revenue",
    description: "Product and service sales revenue",
    balance: 1250000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-15"
  },
  {
    id: "12",
    number: "4100",
    name: "Service Revenue",
    type: "Revenue",
    subType: "Operating Revenue",
    description: "Service-based revenue",
    balance: 185000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-12"
  },
  {
    id: "13",
    number: "5000",
    name: "Cost of Goods Sold",
    type: "Expense",
    subType: "Cost of Sales",
    description: "Direct costs of products sold",
    balance: 750000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-15"
  },
  {
    id: "14",
    number: "6000",
    name: "Salaries Expense",
    type: "Expense",
    subType: "Operating Expense",
    description: "Employee salaries and wages",
    balance: 320000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-15"
  },
  {
    id: "15",
    number: "6100",
    name: "Depreciation Expense",
    type: "Expense",
    subType: "Operating Expense",
    description: "Monthly depreciation charges",
    balance: 55000,
    isActive: true,
    createdDate: "2024-01-01",
    lastActivity: "2024-12-13"
  }
];

const accountTypes = [
  { value: "Asset", label: "Asset", icon: Building, color: "bg-blue-50 text-blue-700 border-blue-200" },
  { value: "Liability", label: "Liability", icon: CreditCard, color: "bg-red-50 text-red-700 border-red-200" },
  { value: "Equity", label: "Equity", icon: PieChart, color: "bg-purple-50 text-purple-700 border-purple-200" },
  { value: "Revenue", label: "Revenue", icon: DollarSign, color: "bg-green-50 text-green-700 border-green-200" },
  { value: "Expense", label: "Expense", icon: FileText, color: "bg-orange-50 text-orange-700 border-orange-200" }
];

const subTypes = {
  Asset: ["Current Asset", "Fixed Asset", "Intangible Asset", "Other Asset"],
  Liability: ["Current Liability", "Long-term Liability", "Other Liability"],
  Equity: ["Owner's Equity", "Retained Earnings", "Other Equity"],
  Revenue: ["Operating Revenue", "Other Revenue"],
  Expense: ["Cost of Sales", "Operating Expense", "Other Expense"]
};

interface Account {
  id: string;
  number: string;
  name: string;
  type: string;
  subType: string;
  description: string;
  balance: number;
  isActive: boolean;
  createdDate: string;
  lastActivity: string;
}

export default function ChartOfAccountsPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>(mockChartOfAccounts);
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New account state
  const [newAccount, setNewAccount] = useState({
    number: '',
    name: '',
    type: '',
    subType: '',
    description: ''
  });

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setAccounts(mockChartOfAccounts);
      } catch (error) {
        console.error('Failed to load chart of accounts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting chart of accounts as ${format}`);
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
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccountTypeConfig = (type: string) => {
    return accountTypes.find(t => t.value === type) || accountTypes[0];
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.number.includes(searchTerm) ||
                         account.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && account.isActive) ||
                         (statusFilter === 'inactive' && !account.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleCreateAccount = async () => {
    if (!newAccount.number || !newAccount.name || !newAccount.type) {
      alert('Please fill in all required fields');
      return;
    }

    const account: Account = {
      id: String(accounts.length + 1),
      ...newAccount,
      balance: 0,
      isActive: true,
      createdDate: new Date().toISOString().split('T')[0],
      lastActivity: new Date().toISOString().split('T')[0]
    };

    setAccounts(prev => [...prev, account]);
    setIsCreateDialogOpen(false);
    setNewAccount({
      number: '',
      name: '',
      type: '',
      subType: '',
      description: ''
    });
  };

  const handleEditAccount = async () => {
    if (!selectedAccount) return;

    setAccounts(prev => prev.map(account =>
      account.id === selectedAccount.id ? selectedAccount : account
    ));
    setIsEditDialogOpen(false);
    setSelectedAccount(null);
  };

  const handleToggleActive = (accountId: string) => {
    setAccounts(prev => prev.map(account =>
      account.id === accountId
        ? { ...account, isActive: !account.isActive }
        : account
    ));
  };

  const handleDeleteAccount = (accountId: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      setAccounts(prev => prev.filter(account => account.id !== accountId));
    }
  };

  const getAccountsSummary = () => {
    const summary = accountTypes.map(type => ({
      type: type.value,
      label: type.label,
      count: accounts.filter(acc => acc.type === type.value && acc.isActive).length,
      totalBalance: accounts
        .filter(acc => acc.type === type.value && acc.isActive)
        .reduce((sum, acc) => sum + Math.abs(acc.balance), 0),
      color: type.color,
      icon: type.icon
    }));
    return summary;
  };

  const accountsSummary = getAccountsSummary();

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
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
            Please log in to access the chart of accounts.
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
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage your complete chart of accounts and account structure
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Account
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

      {/* Account Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {accountsSummary.map((summary) => {
          const Icon = summary.icon;
          return (
            <Card key={summary.type}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{summary.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.count}</div>
                <div className="text-xs text-gray-600">
                  {formatCurrency(summary.totalBalance)} total
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accounts">All Accounts</TabsTrigger>
          <TabsTrigger value="structure">Account Structure</TabsTrigger>
        </TabsList>

        {/* All Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>Complete listing of all accounts</CardDescription>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAccounts.map((account) => {
                  const typeConfig = getAccountTypeConfig(account.type);
                  const Icon = typeConfig.icon;

                  return (
                    <div
                      key={account.id}
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                        !account.isActive ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${typeConfig.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            {account.number} - {account.name}
                            {!account.isActive && (
                              <Badge variant="outline" className="ml-2 text-gray-500">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {account.type} • {account.subType}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {account.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">
                            {account.balance < 0 && account.type === 'Asset' ? '-' : ''}
                            {formatCurrency(account.balance)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Last: {formatDate(account.lastActivity)}
                          </div>
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
                                setSelectedAccount(account);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Account
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(account.id)}
                            >
                              {account.isActive ? (
                                <>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteAccount(account.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Structure Tab */}
        <TabsContent value="structure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {accountTypes.map((type) => {
              const typeAccounts = accounts.filter(acc => acc.type === type.value && acc.isActive);
              const Icon = type.icon;

              return (
                <Card key={type.value}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <CardTitle>{type.label}</CardTitle>
                      <Badge variant="outline">
                        {typeAccounts.length} accounts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {typeAccounts.slice(0, 5).map((account) => (
                        <div
                          key={account.id}
                          className="flex justify-between items-center p-2 hover:bg-gray-50 rounded"
                        >
                          <div>
                            <div className="font-medium text-sm">
                              {account.number} - {account.name}
                            </div>
                            <div className="text-xs text-gray-600">
                              {account.subType}
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCurrency(account.balance)}
                          </div>
                        </div>
                      ))}
                      {typeAccounts.length > 5 && (
                        <div className="text-sm text-gray-500 text-center pt-2">
                          +{typeAccounts.length - 5} more accounts
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to your chart of accounts
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Account Number *</label>
              <Input
                placeholder="e.g., 1050"
                value={newAccount.number}
                onChange={(e) => setNewAccount(prev => ({ ...prev, number: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Name *</label>
              <Input
                placeholder="e.g., Petty Cash"
                value={newAccount.name}
                onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Account Type *</label>
              <Select
                value={newAccount.type}
                onValueChange={(value) => setNewAccount(prev => ({ ...prev, type: value, subType: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Sub Type</label>
              <Select
                value={newAccount.subType}
                onValueChange={(value) => setNewAccount(prev => ({ ...prev, subType: value }))}
                disabled={!newAccount.type}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub type" />
                </SelectTrigger>
                <SelectContent>
                  {newAccount.type && subTypes[newAccount.type as keyof typeof subTypes]?.map(subType => (
                    <SelectItem key={subType} value={subType}>
                      {subType}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Account description"
                value={newAccount.description}
                onChange={(e) => setNewAccount(prev => ({ ...prev, description: e.target.value }))}
              />
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
              onClick={handleCreateAccount}
              disabled={!newAccount.number || !newAccount.name || !newAccount.type}
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedAccount && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Account</DialogTitle>
                <DialogDescription>
                  Update account details and settings
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Account Number</label>
                  <Input
                    value={selectedAccount.number}
                    onChange={(e) => setSelectedAccount(prev => prev ? ({ ...prev, number: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Name</label>
                  <Input
                    value={selectedAccount.name}
                    onChange={(e) => setSelectedAccount(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Account Type</label>
                  <Select
                    value={selectedAccount.type}
                    onValueChange={(value) => setSelectedAccount(prev => prev ? ({ ...prev, type: value, subType: '' }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accountTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Sub Type</label>
                  <Select
                    value={selectedAccount.subType}
                    onValueChange={(value) => setSelectedAccount(prev => prev ? ({ ...prev, subType: value }) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAccount.type && subTypes[selectedAccount.type as keyof typeof subTypes]?.map(subType => (
                        <SelectItem key={subType} value={subType}>
                          {subType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={selectedAccount.description}
                    onChange={(e) => setSelectedAccount(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={selectedAccount.isActive ? "default" : "secondary"}>
                      {selectedAccount.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAccount(prev => prev ? ({ ...prev, isActive: !prev.isActive }) : null)}
                    >
                      {selectedAccount.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleEditAccount}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
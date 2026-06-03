"use client";

// =============================================================================
// GENERAL LEDGER PAGE
// Comprehensive general ledger with account details and transaction history
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Search,
  Filter,
  Calendar,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  DollarSign,
  Book,
  CreditCard,
  Building,
  Users
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockGeneralLedgerData = {
  accounts: [
    {
      accountNumber: "1000",
      accountName: "Cash - Operating Account",
      accountType: "Asset",
      currentBalance: 125000,
      debitBalance: 850000,
      creditBalance: 725000,
      transactions: [
        {
          date: "2024-12-15",
          description: "Customer Payment - INV-2024-1245",
          reference: "JE-2024-0156",
          debit: 15000,
          credit: 0,
          balance: 125000
        },
        {
          date: "2024-12-14",
          description: "Supplier Payment - PO-2024-0892",
          reference: "JE-2024-0155",
          debit: 0,
          credit: 8500,
          balance: 110000
        },
        {
          date: "2024-12-13",
          description: "Bank Service Charges",
          reference: "JE-2024-0154",
          debit: 0,
          credit: 45,
          balance: 118500
        }
      ]
    },
    {
      accountNumber: "1200",
      accountName: "Accounts Receivable",
      accountType: "Asset",
      currentBalance: 85000,
      debitBalance: 320000,
      creditBalance: 235000,
      transactions: [
        {
          date: "2024-12-15",
          description: "Customer Payment Received",
          reference: "JE-2024-0156",
          debit: 0,
          credit: 15000,
          balance: 85000
        },
        {
          date: "2024-12-12",
          description: "Sales Invoice - INV-2024-1248",
          reference: "JE-2024-0153",
          debit: 22000,
          credit: 0,
          balance: 100000
        }
      ]
    },
    {
      accountNumber: "2000",
      accountName: "Accounts Payable",
      accountType: "Liability",
      currentBalance: 65000,
      debitBalance: 180000,
      creditBalance: 245000,
      transactions: [
        {
          date: "2024-12-14",
          description: "Payment to Supplier",
          reference: "JE-2024-0155",
          debit: 8500,
          credit: 0,
          balance: 65000
        },
        {
          date: "2024-12-10",
          description: "Purchase Invoice - PO-2024-0895",
          reference: "JE-2024-0152",
          debit: 0,
          credit: 12000,
          balance: 73500
        }
      ]
    },
    {
      accountNumber: "4000",
      accountName: "Sales Revenue",
      accountType: "Revenue",
      currentBalance: 1250000,
      debitBalance: 25000,
      creditBalance: 1275000,
      transactions: [
        {
          date: "2024-12-12",
          description: "Product Sales - INV-2024-1248",
          reference: "JE-2024-0153",
          debit: 0,
          credit: 22000,
          balance: 1250000
        },
        {
          date: "2024-12-11",
          description: "Service Revenue - INV-2024-1247",
          reference: "JE-2024-0151",
          debit: 0,
          credit: 8500,
          balance: 1228000
        }
      ]
    }
  ],
  trialBalance: {
    totalDebits: 1355000,
    totalCredits: 1355000,
    isBalanced: true
  },
  period: "December 2024"
};

interface GeneralLedgerAccount {
  accountNumber: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
  debitBalance: number;
  creditBalance: number;
  transactions: Transaction[];
}

interface Transaction {
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function GeneralLedgerPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [ledgerData, setLedgerData] = useState(mockGeneralLedgerData);
  const [activeTab, setActiveTab] = useState('accounts');
  const [selectedAccount, setSelectedAccount] = useState<GeneralLedgerAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const loadGeneralLedger = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLedgerData(mockGeneralLedgerData);
      } catch (error) {
        console.error('Failed to load general ledger:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGeneralLedger();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting general ledger as ${format}`);
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
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredAccounts = ledgerData.accounts.filter(account => {
    const matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.accountNumber.includes(searchTerm);
    const matchesType = accountTypeFilter === 'all' || account.accountType === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'Asset': return <Building className="h-4 w-4" />;
      case 'Liability': return <CreditCard className="h-4 w-4" />;
      case 'Revenue': return <DollarSign className="h-4 w-4" />;
      case 'Expense': return <FileText className="h-4 w-4" />;
      default: return <Book className="h-4 w-4" />;
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Asset': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Liability': return 'text-red-600 bg-red-50 border-red-200';
      case 'Revenue': return 'text-green-600 bg-green-50 border-green-200';
      case 'Expense': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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
            Please log in to access the general ledger.
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
          <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
          <p className="text-gray-600 mt-1">
            Complete account details and transaction history for {ledgerData.period}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ledgerData.accounts.length}</div>
            <div className="text-xs text-gray-600">Active chart of accounts</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ledgerData.trialBalance.totalDebits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Period total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${ledgerData.trialBalance.totalCredits.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Period total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Balance</CardTitle>
            <Badge variant={ledgerData.trialBalance.isBalanced ? "default" : "destructive"}>
              {ledgerData.trialBalance.isBalanced ? "Balanced" : "Unbalanced"}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {ledgerData.trialBalance.isBalanced ? "✓" : "✗"}
            </div>
            <div className="text-xs text-gray-600">
              {ledgerData.trialBalance.isBalanced ? "Books are balanced" : "Requires review"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Account Details</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>

        {/* Chart of Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Chart of Accounts</CardTitle>
                  <CardDescription>Complete listing of all general ledger accounts</CardDescription>
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
                  <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Asset">Assets</SelectItem>
                      <SelectItem value="Liability">Liabilities</SelectItem>
                      <SelectItem value="Revenue">Revenue</SelectItem>
                      <SelectItem value="Expense">Expenses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.accountNumber}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedAccount(account);
                      setActiveTab('transactions');
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${getAccountTypeColor(account.accountType)}`}>
                        {getAccountTypeIcon(account.accountType)}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {account.accountNumber} - {account.accountName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {account.accountType} • {account.transactions.length} transactions
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(account.currentBalance)}</div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Details Tab */}
        <TabsContent value="transactions" className="space-y-6">
          {selectedAccount ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedAccount.accountNumber} - {selectedAccount.accountName}
                    </CardTitle>
                    <CardDescription>
                      Detailed transaction history and account activity
                    </CardDescription>
                  </div>
                  <Badge className={getAccountTypeColor(selectedAccount.accountType)}>
                    {selectedAccount.accountType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Account Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-600">Current Balance</div>
                      <div className="text-xl font-bold">{formatCurrency(selectedAccount.currentBalance)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Debits</div>
                      <div className="text-xl font-bold">{formatCurrency(selectedAccount.debitBalance)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Credits</div>
                      <div className="text-xl font-bold">{formatCurrency(selectedAccount.creditBalance)}</div>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div>
                    <h4 className="font-semibold mb-4">Transaction History</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-medium">Date</th>
                            <th className="text-left p-3 font-medium">Description</th>
                            <th className="text-left p-3 font-medium">Reference</th>
                            <th className="text-right p-3 font-medium">Debit</th>
                            <th className="text-right p-3 font-medium">Credit</th>
                            <th className="text-right p-3 font-medium">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAccount.transactions.map((transaction, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="p-3">{formatDate(transaction.date)}</td>
                              <td className="p-3">{transaction.description}</td>
                              <td className="p-3">
                                <Badge variant="outline">{transaction.reference}</Badge>
                              </td>
                              <td className="p-3 text-right">
                                {transaction.debit > 0 ? formatCurrency(transaction.debit) : '-'}
                              </td>
                              <td className="p-3 text-right">
                                {transaction.credit > 0 ? formatCurrency(transaction.credit) : '-'}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {formatCurrency(transaction.balance)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Account</h3>
                <p className="text-gray-600">
                  Choose an account from the Chart of Accounts to view detailed transaction history.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setActiveTab('accounts')}
                >
                  Browse Accounts
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Trial Balance Tab */}
        <TabsContent value="trial-balance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>
                Summary of all account balances to verify debits equal credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Trial Balance Status */}
                <div className={`p-4 rounded-lg border ${
                  ledgerData.trialBalance.isBalanced
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${
                      ledgerData.trialBalance.isBalanced
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {ledgerData.trialBalance.isBalanced ? '✓' : '✗'}
                    </div>
                    <div>
                      <div className="font-semibold">
                        Trial Balance {ledgerData.trialBalance.isBalanced ? 'Balanced' : 'Unbalanced'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ledgerData.trialBalance.isBalanced
                          ? 'All debits equal credits - books are in balance'
                          : 'Debits and credits do not match - requires investigation'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trial Balance Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">Account #</th>
                        <th className="text-left p-3 font-medium">Account Name</th>
                        <th className="text-left p-3 font-medium">Type</th>
                        <th className="text-right p-3 font-medium">Debit Balance</th>
                        <th className="text-right p-3 font-medium">Credit Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerData.accounts.map((account) => (
                        <tr key={account.accountNumber} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-mono">{account.accountNumber}</td>
                          <td className="p-3">{account.accountName}</td>
                          <td className="p-3">
                            <Badge variant="outline" className={getAccountTypeColor(account.accountType)}>
                              {account.accountType}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            {account.currentBalance >= 0 && (account.accountType === 'Asset' || account.accountType === 'Expense')
                              ? formatCurrency(account.currentBalance)
                              : '-'
                            }
                          </td>
                          <td className="p-3 text-right">
                            {account.currentBalance >= 0 && (account.accountType === 'Liability' || account.accountType === 'Revenue')
                              ? formatCurrency(account.currentBalance)
                              : account.currentBalance < 0
                              ? formatCurrency(Math.abs(account.currentBalance))
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-900 bg-gray-100 font-semibold">
                        <td colSpan={3} className="p-3">TOTALS</td>
                        <td className="p-3 text-right">
                          {formatCurrency(ledgerData.trialBalance.totalDebits)}
                        </td>
                        <td className="p-3 text-right">
                          {formatCurrency(ledgerData.trialBalance.totalCredits)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
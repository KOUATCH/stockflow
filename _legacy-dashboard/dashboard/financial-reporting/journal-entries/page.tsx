"use client";

// =============================================================================
// JOURNAL ENTRIES PAGE
// Complete journal entry management with creation, approval, and posting
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
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Download,
  Search,
  Filter,
  Calendar,
  Eye,
  Shield,
  AlertTriangle,
  FileText,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Mock data for demonstration - replace with actual API calls
const mockJournalEntries = [
  {
    id: "JE-2024-0156",
    date: "2024-12-15",
    description: "Customer Payment - INV-2024-1245",
    reference: "INV-2024-1245",
    status: "posted",
    createdBy: "John Doe",
    approvedBy: "Jane Smith",
    totalDebit: 15000,
    totalCredit: 15000,
    lineItems: [
      {
        accountNumber: "1000",
        accountName: "Cash - Operating Account",
        description: "Payment received from customer",
        debit: 15000,
        credit: 0
      },
      {
        accountNumber: "1200",
        accountName: "Accounts Receivable",
        description: "Customer payment applied",
        debit: 0,
        credit: 15000
      }
    ]
  },
  {
    id: "JE-2024-0155",
    date: "2024-12-14",
    description: "Supplier Payment - PO-2024-0892",
    reference: "PO-2024-0892",
    status: "posted",
    createdBy: "Sarah Wilson",
    approvedBy: "John Doe",
    totalDebit: 8500,
    totalCredit: 8500,
    lineItems: [
      {
        accountNumber: "2000",
        accountName: "Accounts Payable",
        description: "Payment to supplier",
        debit: 8500,
        credit: 0
      },
      {
        accountNumber: "1000",
        accountName: "Cash - Operating Account",
        description: "Supplier payment made",
        debit: 0,
        credit: 8500
      }
    ]
  },
  {
    id: "JE-2024-0154",
    date: "2024-12-13",
    description: "Monthly Depreciation Entry",
    reference: "DEP-2024-12",
    status: "pending_approval",
    createdBy: "Mike Johnson",
    approvedBy: null,
    totalDebit: 5500,
    totalCredit: 5500,
    lineItems: [
      {
        accountNumber: "6100",
        accountName: "Depreciation Expense",
        description: "Monthly depreciation charge",
        debit: 5500,
        credit: 0
      },
      {
        accountNumber: "1510",
        accountName: "Accumulated Depreciation",
        description: "Asset depreciation accumulation",
        debit: 0,
        credit: 5500
      }
    ]
  },
  {
    id: "JE-2024-0153",
    date: "2024-12-12",
    description: "Sales Revenue Recognition",
    reference: "INV-2024-1248",
    status: "draft",
    createdBy: "Emily Davis",
    approvedBy: null,
    totalDebit: 22000,
    totalCredit: 22000,
    lineItems: [
      {
        accountNumber: "1200",
        accountName: "Accounts Receivable",
        description: "Sales invoice posted",
        debit: 22000,
        credit: 0
      },
      {
        accountNumber: "4000",
        accountName: "Sales Revenue",
        description: "Product sales revenue",
        debit: 0,
        credit: 22000
      }
    ]
  }
];

const mockChartOfAccounts = [
  { number: "1000", name: "Cash - Operating Account", type: "Asset" },
  { number: "1200", name: "Accounts Receivable", type: "Asset" },
  { number: "1500", name: "Equipment", type: "Asset" },
  { number: "1510", name: "Accumulated Depreciation", type: "Asset" },
  { number: "2000", name: "Accounts Payable", type: "Liability" },
  { number: "2100", name: "Accrued Expenses", type: "Liability" },
  { number: "3000", name: "Owner's Equity", type: "Equity" },
  { number: "4000", name: "Sales Revenue", type: "Revenue" },
  { number: "5000", name: "Cost of Goods Sold", type: "Expense" },
  { number: "6100", name: "Depreciation Expense", type: "Expense" },
];

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'posted' | 'rejected';
  createdBy: string;
  approvedBy: string | null;
  totalDebit: number;
  totalCredit: number;
  lineItems: JournalLineItem[];
}

interface JournalLineItem {
  accountNumber: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

export default function JournalEntriesPage() {
  const { user, isLoading: authLoading, error: authError } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(mockJournalEntries);
  const [activeTab, setActiveTab] = useState('entries');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // New journal entry state
  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    reference: '',
    lineItems: [
      { accountNumber: '', accountName: '', description: '', debit: 0, credit: 0 },
      { accountNumber: '', accountName: '', description: '', debit: 0, credit: 0 }
    ]
  });

  useEffect(() => {
    const loadJournalEntries = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setJournalEntries(mockJournalEntries);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadJournalEntries();
  }, [user]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`Exporting journal entries as ${format}`);
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Edit },
      pending_approval: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
      posted: { color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle }
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

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addLineItem = () => {
    setNewEntry(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { accountNumber: '', accountName: '', description: '', debit: 0, credit: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (newEntry.lineItems.length > 2) {
      setNewEntry(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    setNewEntry(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotals = () => {
    const totalDebit = newEntry.lineItems.reduce((sum, item) => sum + (item.debit || 0), 0);
    const totalCredit = newEntry.lineItems.reduce((sum, item) => sum + (item.credit || 0), 0);
    return { totalDebit, totalCredit, isBalanced: totalDebit === totalCredit };
  };

  const handleCreateEntry = async () => {
    const totals = calculateTotals();
    if (!totals.isBalanced) {
      alert('Journal entry must be balanced (debits must equal credits)');
      return;
    }

    // Simulate creating entry
    const newJournalEntry: JournalEntry = {
      id: `JE-2024-${String(journalEntries.length + 1).padStart(4, '0')}`,
      date: newEntry.date,
      description: newEntry.description,
      reference: newEntry.reference,
      status: 'draft',
      createdBy: user?.name || 'Current User',
      approvedBy: null,
      totalDebit: totals.totalDebit,
      totalCredit: totals.totalCredit,
      lineItems: newEntry.lineItems.filter(item => item.accountNumber && (item.debit > 0 || item.credit > 0))
    };

    setJournalEntries(prev => [newJournalEntry, ...prev]);
    setIsCreateDialogOpen(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      reference: '',
      lineItems: [
        { accountNumber: '', accountName: '', description: '', debit: 0, credit: 0 },
        { accountNumber: '', accountName: '', description: '', debit: 0, credit: 0 }
      ]
    });
  };

  const handleApproveEntry = (entryId: string) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, status: 'approved', approvedBy: user?.name || 'Current User' }
        : entry
    ));
  };

  const handlePostEntry = (entryId: string) => {
    setJournalEntries(prev => prev.map(entry =>
      entry.id === entryId
        ? { ...entry, status: 'posted' }
        : entry
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
            Please log in to access journal entries.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Journal Entries</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and post journal entries to the general ledger
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
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
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalEntries.length}</div>
            <div className="text-xs text-gray-600">All time</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {journalEntries.filter(e => e.status === 'pending_approval').length}
            </div>
            <div className="text-xs text-gray-600">Requiring action</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posted This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {journalEntries.filter(e => e.status === 'posted').length}
            </div>
            <div className="text-xs text-gray-600">Successfully posted</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft Entries</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {journalEntries.filter(e => e.status === 'draft').length}
            </div>
            <div className="text-xs text-gray-600">Work in progress</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>All journal entries and their current status</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending_approval">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="posted">Posted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">{entry.id}</div>
                    <div className="text-sm text-gray-600">{formatDate(entry.date)}</div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{entry.description}</div>
                    <div className="text-sm text-gray-600">
                      Ref: {entry.reference} • Created by {entry.createdBy}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(entry.totalDebit)}</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div>
                    {getStatusBadge(entry.status)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {entry.status === 'pending_approval' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApproveEntry(entry.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {entry.status === 'approved' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePostEntry(entry.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Journal Entry Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Journal Entry</DialogTitle>
            <DialogDescription>
              Enter the details for the new journal entry. Ensure debits equal credits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Entry Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reference</label>
                <Input
                  placeholder="Reference number"
                  value={newEntry.reference}
                  onChange={(e) => setNewEntry(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Amount</label>
                <div className="text-lg font-semibold text-green-600">
                  {formatCurrency(totals.totalDebit)}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Journal entry description"
                value={newEntry.description}
                onChange={(e) => setNewEntry(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Line Items</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Line
                </Button>
              </div>

              <div className="space-y-4">
                {newEntry.lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border rounded-lg">
                    <div className="col-span-2">
                      <label className="text-xs font-medium">Account</label>
                      <Select
                        value={item.accountNumber}
                        onValueChange={(value) => {
                          const account = mockChartOfAccounts.find(acc => acc.number === value);
                          updateLineItem(index, 'accountNumber', value);
                          updateLineItem(index, 'accountName', account?.name || '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockChartOfAccounts.map((account) => (
                            <SelectItem key={account.number} value={account.number}>
                              {account.number} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-medium">Description</label>
                      <Input
                        placeholder="Line description"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium">Debit</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.debit || ''}
                        onChange={(e) => updateLineItem(index, 'debit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-medium">Credit</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.credit || ''}
                        onChange={(e) => updateLineItem(index, 'credit', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      {newEntry.lineItems.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Debits: </span>
                    <span className="font-bold">{formatCurrency(totals.totalDebit)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Total Credits: </span>
                    <span className="font-bold">{formatCurrency(totals.totalCredit)}</span>
                  </div>
                  <div>
                    <span className="font-medium">Balance: </span>
                    <Badge variant={totals.isBalanced ? "default" : "destructive"}>
                      {totals.isBalanced ? "Balanced" : "Unbalanced"}
                    </Badge>
                  </div>
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
              onClick={handleCreateEntry}
              disabled={!totals.isBalanced || !newEntry.description || !newEntry.date}
            >
              Create Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Journal Entry Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEntry.id}</DialogTitle>
                <DialogDescription>
                  Journal entry details and line items
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Entry Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date</label>
                    <div>{formatDate(selectedEntry.date)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <div>{getStatusBadge(selectedEntry.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reference</label>
                    <div>{selectedEntry.reference}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Total Amount</label>
                    <div className="font-semibold">{formatCurrency(selectedEntry.totalDebit)}</div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <div>{selectedEntry.description}</div>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h4 className="font-semibold mb-4">Line Items</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium">Account</th>
                          <th className="text-left p-3 font-medium">Description</th>
                          <th className="text-right p-3 font-medium">Debit</th>
                          <th className="text-right p-3 font-medium">Credit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEntry.lineItems.map((item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-3">
                              <div className="font-medium">{item.accountNumber}</div>
                              <div className="text-sm text-gray-600">{item.accountName}</div>
                            </td>
                            <td className="p-3">{item.description}</td>
                            <td className="p-3 text-right">
                              {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                            </td>
                            <td className="p-3 text-right">
                              {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-900 bg-gray-100 font-semibold">
                          <td colSpan={2} className="p-3">TOTALS</td>
                          <td className="p-3 text-right">{formatCurrency(selectedEntry.totalDebit)}</td>
                          <td className="p-3 text-right">{formatCurrency(selectedEntry.totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Workflow */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-600">Created By</label>
                    <div>{selectedEntry.createdBy}</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-600">Approved By</label>
                    <div>{selectedEntry.approvedBy || 'Pending'}</div>
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
                {selectedEntry.status === 'pending_approval' && (
                  <Button
                    onClick={() => {
                      handleApproveEntry(selectedEntry.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Approve Entry
                  </Button>
                )}
                {selectedEntry.status === 'approved' && (
                  <Button
                    onClick={() => {
                      handlePostEntry(selectedEntry.id);
                      setIsViewDialogOpen(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Post Entry
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Wallet
} from "lucide-react";
import Link from "next/link";

interface FinancialPageProps {
  params: {
    id: string;
  };
}

// Mock financial data
const mockFinancialData = {
  creditLimit: 50000,
  creditUsed: 18750,
  availableCredit: 31250,
  paymentTerms: 30,
  currentBalance: 8420.50,
  overdueAmount: 2150.75,
  totalPaid: 185000,
  totalOutstanding: 10571.25,
  averagePaymentDays: 28,
  paymentHistory: [
    {
      id: "pay_001",
      date: new Date("2024-11-15"),
      amount: 15420.50,
      status: "paid",
      daysToPayment: 25,
      invoiceNumber: "INV-2024-001"
    },
    {
      id: "pay_002",
      date: new Date("2024-10-28"),
      amount: 8750.00,
      status: "paid",
      daysToPayment: 30,
      invoiceNumber: "INV-2024-002"
    },
    {
      id: "pay_003",
      date: new Date("2024-10-12"),
      amount: 22100.75,
      status: "paid",
      daysToPayment: 28,
      invoiceNumber: "INV-2024-003"
    },
    {
      id: "pay_004",
      date: new Date("2024-09-30"),
      amount: 5680.25,
      status: "overdue",
      daysToPayment: null,
      invoiceNumber: "INV-2024-004"
    }
  ],
  monthlySpend: [
    { month: "Jan", amount: 12500 },
    { month: "Feb", amount: 15800 },
    { month: "Mar", amount: 18200 },
    { month: "Apr", amount: 14500 },
    { month: "May", amount: 22100 },
    { month: "Jun", amount: 19800 },
    { month: "Jul", amount: 16400 },
    { month: "Aug", amount: 21300 },
    { month: "Sep", amount: 17900 },
    { month: "Oct", amount: 25600 },
    { month: "Nov", amount: 23450 },
    { month: "Dec", amount: 19200 }
  ]
};

const mockSupplierData = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001"
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case "overdue":
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Overdue
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

export default async function FinancialPage({ params }: FinancialPageProps) {
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to view financial data.</p>
          </div>
        </div>
      </div>
    );
  }

  const supplier = mockSupplierData;
  const financial = mockFinancialData;

  const creditUtilization = (financial.creditUsed / financial.creditLimit) * 100;
  const yearlyTotal = financial.monthlySpend.reduce((sum, month) => sum + month.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/purchases/suppliers/${params.id}`}>
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Details
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                Financial Summary
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                {supplier.name} ({supplier.code})
              </p>
            </div>
            <div className="ml-auto">
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Credit Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Credit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {formatCurrency(financial.availableCredit)}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Available Credit</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Credit Utilization</span>
                    <span className="font-medium">{creditUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={creditUtilization}
                    className="h-2"
                    indicatorClassName={
                      creditUtilization > 80 ? "bg-red-500" :
                      creditUtilization > 60 ? "bg-yellow-500" : "bg-green-500"
                    }
                  />
                  <div className="flex justify-between text-xs mt-2 text-slate-500 dark:text-slate-400">
                    <span>Used: {formatCurrency(financial.creditUsed)}</span>
                    <span>Limit: {formatCurrency(financial.creditLimit)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Payment Terms</span>
                    <span className="font-medium">Net {financial.paymentTerms} days</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Avg Payment Days</span>
                    <span className={`font-medium ${
                      financial.averagePaymentDays <= financial.paymentTerms ?
                      "text-green-600 dark:text-green-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {financial.averagePaymentDays} days
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600 dark:text-slate-400">Total Paid YTD</span>
                    <span className="font-medium">{formatCurrency(financial.totalPaid)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Outstanding Balances */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Current Balance</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(financial.currentBalance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Overdue Amount</p>
                      <p className="text-xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(financial.overdueAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Outstanding</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(financial.totalOutstanding)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Spending Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Spending Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(yearlyTotal)}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Yearly Spend</p>
                  </div>

                  <div className="grid grid-cols-12 gap-2 h-32 items-end">
                    {financial.monthlySpend.map((month, index) => {
                      const maxAmount = Math.max(...financial.monthlySpend.map(m => m.amount));
                      const height = (month.amount / maxAmount) * 100;

                      return (
                        <div key={index} className="flex flex-col items-center gap-1">
                          <div
                            className="w-full bg-blue-500 dark:bg-blue-400 rounded-t-sm hover:bg-blue-600 dark:hover:bg-blue-300 transition-colors cursor-pointer"
                            style={{ height: `${height}%`, minHeight: '8px' }}
                            title={`${month.month}: ${formatCurrency(month.amount)}`}
                          />
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {month.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Monthly average: {formatCurrency(yearlyTotal / 12)}</span>
                    <span>Highest: {formatCurrency(Math.max(...financial.monthlySpend.map(m => m.amount)))}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Payment History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Invoice</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Date</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Amount</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Status</th>
                        <th className="text-left py-3 px-2 font-semibold text-slate-900 dark:text-white">Days to Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financial.paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {payment.invoiceNumber}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-400">
                                {formatDate(payment.date)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(payment.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {getPaymentStatusBadge(payment.status)}
                          </td>
                          <td className="py-3 px-2">
                            {payment.daysToPayment ? (
                              <span className={`font-medium ${
                                payment.daysToPayment <= financial.paymentTerms ?
                                "text-green-600 dark:text-green-400" :
                                "text-red-600 dark:text-red-400"
                              }`}>
                                {payment.daysToPayment} days
                              </span>
                            ) : (
                              <span className="text-slate-400">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
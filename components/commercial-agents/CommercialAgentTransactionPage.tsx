"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Package, Calculator, DollarSign, ArrowRight } from "lucide-react";
import { AgentTransactionStatus, PaymentMethod } from "@prisma/client";
import type {
  AgentTransactionWithLines,
  CommercialAgent,
  AgentTransactionSummary,
  ReconcileTransactionLineData,
} from "@/types/commercialAgent";

interface CommercialAgentTransactionPageProps {
  agents: CommercialAgent[];
  transaction?: AgentTransactionWithLines;
  onDispatchGoods: (data: any) => Promise<void>;
  onReconcileTransaction: (data: any) => Promise<void>;
  onCreateSettlement: (data: any) => Promise<void>;
}

export default function CommercialAgentTransactionPage({
  agents,
  transaction,
  onDispatchGoods,
  onReconcileTransaction,
  onCreateSettlement,
}: CommercialAgentTransactionPageProps) {
  const [selectedAgent, setSelectedAgent] = useState<CommercialAgent | null>(null);
  const [dispatchItems, setDispatchItems] = useState<any[]>([]);
  const [reconciliationData, setReconciliationData] = useState<ReconcileTransactionLineData[]>([]);
  const [settlementData, setSettlementData] = useState({
    paidAmount: 0,
    discountGiven: 0,
    paymentMethod: PaymentMethod.CASH,
    paymentReference: "",
    notes: "",
  });
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);

  // Calculate transaction summary
  const transactionSummary: AgentTransactionSummary = useMemo(() => {
    if (!transaction) {
      return {
        beginningStock: { totalQuantity: 0, totalValue: 0 },
        finalStock: { totalQuantity: 0, totalValue: 0 },
        amountSold: { totalQuantity: 0, totalValue: 0 },
        costOfGoodsSold: 0,
        totalMoneyToBePaid: 0,
        commissionEarned: 0,
        netAmountDue: 0,
      };
    }

    const beginningQuantity = transaction.totalQuantityDispatched;
    const beginningValue = transaction.totalDispatchValue;

    const soldQuantity = transaction.totalQuantitySold;
    const soldValue = transaction.totalSalesValue;

    const returnedQuantity = transaction.totalQuantityReturned;
    const returnedValue = transaction.totalReturnValue;

    const finalQuantity = returnedQuantity;
    const finalValue = returnedValue;

    const costOfGoodsSold = soldQuantity > 0
      ? transaction.transactionLines.reduce((total, line) =>
          total + (line.quantitySold * line.costPrice), 0)
      : 0;

    return {
      beginningStock: {
        totalQuantity: beginningQuantity,
        totalValue: beginningValue,
      },
      finalStock: {
        totalQuantity: finalQuantity,
        totalValue: finalValue,
      },
      amountSold: {
        totalQuantity: soldQuantity,
        totalValue: soldValue,
      },
      costOfGoodsSold,
      totalMoneyToBePaid: soldValue,
      commissionEarned: transaction.commissionAmount,
      netAmountDue: transaction.amountDue,
    };
  }, [transaction]);

  useEffect(() => {
    if (transaction) {
      setReconciliationData(
        transaction.transactionLines.map((line) => ({
          lineId: line.id,
          quantitySold: line.quantitySold,
          quantityReturned: line.quantityReturned,
          actualSellingPrice: line.sellingPrice,
        }))
      );
    }
  }, [transaction]);

  const handleAddDispatchItem = () => {
    setDispatchItems([
      ...dispatchItems,
      {
        itemId: "",
        quantityDispatched: 0,
        sellingPrice: 0,
      },
    ]);
  };

  const handleRemoveDispatchItem = (index: number) => {
    setDispatchItems(dispatchItems.filter((_, i) => i !== index));
  };

  const handleDispatchSubmit = async () => {
    if (!selectedAgent || dispatchItems.length === 0) return;

    const data = {
      agentId: selectedAgent.id,
      transactionLines: dispatchItems,
      notes: "",
    };

    await onDispatchGoods(data);
    setIsDispatchDialogOpen(false);
    setDispatchItems([]);
  };

  const handleReconcileSubmit = async () => {
    if (!transaction) return;

    const data = {
      transactionId: transaction.id,
      transactionLines: reconciliationData,
      actualReturnDate: new Date(),
    };

    await onReconcileTransaction(data);
    setIsReconcileDialogOpen(false);
  };

  const handleSettlementSubmit = async () => {
    if (!transaction) return;

    const data = {
      transactionId: transaction.id,
      ...settlementData,
    };

    await onCreateSettlement(data);
    setIsSettlementDialogOpen(false);
  };

  const getStatusBadge = (status: AgentTransactionStatus) => {
    const statusMap = {
      [AgentTransactionStatus.PENDING]: { label: "Pending", variant: "secondary" as const },
      [AgentTransactionStatus.OUT_FOR_SALES]: { label: "Out for Sales", variant: "default" as const },
      [AgentTransactionStatus.RETURNED]: { label: "Returned", variant: "outline" as const },
      [AgentTransactionStatus.RECONCILED]: { label: "Reconciled", variant: "default" as const },
      [AgentTransactionStatus.CANCELLED]: { label: "Cancelled", variant: "destructive" as const },
    };

    const { label, variant } = statusMap[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commercial Agent Transactions</h1>
          <p className="text-gray-600">
            Manage goods dispatch, sales tracking, and settlements
          </p>
        </div>
        <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Dispatch Goods
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Dispatch Goods to Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Agent</Label>
                <Select
                  value={selectedAgent?.id || ""}
                  onValueChange={(value) =>
                    setSelectedAgent(agents.find((a) => a.id === value) || null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select commercial agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name} ({agent.agentCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Items to Dispatch</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDispatchItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Item
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dispatchItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            placeholder="Select item..."
                            className="w-full"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantityDispatched}
                            onChange={(e) => {
                              const newItems = [...dispatchItems];
                              newItems[index].quantityDispatched = parseInt(e.target.value);
                              setDispatchItems(newItems);
                            }}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.sellingPrice}
                            onChange={(e) => {
                              const newItems = [...dispatchItems];
                              newItems[index].sellingPrice = parseFloat(e.target.value);
                              setDispatchItems(newItems);
                            }}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveDispatchItem(index)}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDispatchDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleDispatchSubmit}>
                  Dispatch Goods
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction Details */}
      {transaction && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            {/* Transaction Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Transaction {transaction.transactionNumber}
                  </CardTitle>
                  {getStatusBadge(transaction.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">Agent</Label>
                    <p className="font-medium">
                      {transaction.agent.name} ({transaction.agent.agentCode})
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Dispatch Date</Label>
                    <p className="font-medium">
                      {new Date(transaction.dispatchDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Return Date</Label>
                    <p className="font-medium">
                      {transaction.actualReturnDate
                        ? new Date(transaction.actualReturnDate).toLocaleDateString()
                        : "Not returned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Beginning Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {transactionSummary.beginningStock.totalQuantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Value: ${transactionSummary.beginningStock.totalValue.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Amount Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-green-600">
                      {transactionSummary.amountSold.totalQuantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Value: ${transactionSummary.amountSold.totalValue.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Final Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold">
                      {transactionSummary.finalStock.totalQuantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Value: ${transactionSummary.finalStock.totalValue.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Amount Due
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-blue-600">
                      ${transactionSummary.netAmountDue.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Commission: ${transactionSummary.commissionEarned.toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Sales Value:</span>
                    <span className="font-medium">
                      ${transactionSummary.totalMoneyToBePaid.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost of Goods Sold:</span>
                    <span className="font-medium">
                      ${transactionSummary.costOfGoodsSold.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Earned:</span>
                    <span className="font-medium text-green-600">
                      ${transactionSummary.commissionEarned.toFixed(2)}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Net Amount Due:</span>
                    <span className="text-blue-600">
                      ${transactionSummary.netAmountDue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Cost Price</TableHead>
                      <TableHead>Selling Price</TableHead>
                      <TableHead>Dispatched</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Returned</TableHead>
                      <TableHead>Sales Value</TableHead>
                      <TableHead>Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transaction.transactionLines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-medium">{line.itemName}</TableCell>
                        <TableCell>{line.itemSku}</TableCell>
                        <TableCell>${line.costPrice.toFixed(2)}</TableCell>
                        <TableCell>${line.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell>{line.quantityDispatched}</TableCell>
                        <TableCell className="text-green-600">
                          {line.quantitySold}
                        </TableCell>
                        <TableCell>{line.quantityReturned}</TableCell>
                        <TableCell>${line.salesValue.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600">
                          ${line.commission.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reconciliation">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Transaction Reconciliation</CardTitle>
                  {transaction.status === AgentTransactionStatus.OUT_FOR_SALES && (
                    <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Reconcile Transaction
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl">
                        <DialogHeader>
                          <DialogTitle>Reconcile Transaction</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Dispatched</TableHead>
                                <TableHead>Sold</TableHead>
                                <TableHead>Returned</TableHead>
                                <TableHead>Actual Selling Price</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {reconciliationData.map((data, index) => {
                                const line = transaction.transactionLines[index];
                                return (
                                  <TableRow key={data.lineId}>
                                    <TableCell>{line.itemName}</TableCell>
                                    <TableCell>{line.quantityDispatched}</TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={data.quantitySold}
                                        onChange={(e) => {
                                          const newData = [...reconciliationData];
                                          newData[index].quantitySold = parseInt(e.target.value);
                                          // Auto-calculate returned quantity
                                          newData[index].quantityReturned =
                                            line.quantityDispatched - parseInt(e.target.value);
                                          setReconciliationData(newData);
                                        }}
                                        className="w-20"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        value={data.quantityReturned}
                                        onChange={(e) => {
                                          const newData = [...reconciliationData];
                                          newData[index].quantityReturned = parseInt(e.target.value);
                                          setReconciliationData(newData);
                                        }}
                                        className="w-20"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        value={data.actualSellingPrice}
                                        onChange={(e) => {
                                          const newData = [...reconciliationData];
                                          newData[index].actualSellingPrice = parseFloat(e.target.value);
                                          setReconciliationData(newData);
                                        }}
                                        className="w-24"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsReconcileDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleReconcileSubmit}>
                              Complete Reconciliation
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {transaction.status === AgentTransactionStatus.OUT_FOR_SALES ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Transaction is currently out for sales. Use the reconcile button to record
                      sales and returns.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Transaction has been reconciled.</p>
                    {transaction.reconciledAt && (
                      <p className="text-sm text-gray-500 mt-1">
                        Reconciled on {new Date(transaction.reconciledAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settlement">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Payment Settlement</CardTitle>
                  {transaction.status === AgentTransactionStatus.RECONCILED && !transaction.settlement && (
                    <Dialog open={isSettlementDialogOpen} onOpenChange={setIsSettlementDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <DollarSign className="w-4 h-4 mr-2" />
                          Process Settlement
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Payment Settlement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Total Amount Due</Label>
                            <p className="text-lg font-bold">${transaction.amountDue.toFixed(2)}</p>
                          </div>

                          <div>
                            <Label>Paid Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={settlementData.paidAmount}
                              onChange={(e) =>
                                setSettlementData({
                                  ...settlementData,
                                  paidAmount: parseFloat(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Discount Given</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={settlementData.discountGiven}
                              onChange={(e) =>
                                setSettlementData({
                                  ...settlementData,
                                  discountGiven: parseFloat(e.target.value),
                                })
                              }
                            />
                          </div>

                          <div>
                            <Label>Payment Method</Label>
                            <Select
                              value={settlementData.paymentMethod}
                              onValueChange={(value) =>
                                setSettlementData({
                                  ...settlementData,
                                  paymentMethod: value as PaymentMethod,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                                <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                                <SelectItem value={PaymentMethod.DIGITAL}>Digital</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Payment Reference</Label>
                            <Input
                              value={settlementData.paymentReference}
                              onChange={(e) =>
                                setSettlementData({
                                  ...settlementData,
                                  paymentReference: e.target.value,
                                })
                              }
                              placeholder="Transaction ID, check number, etc."
                            />
                          </div>

                          <div>
                            <Label>Notes</Label>
                            <Textarea
                              value={settlementData.notes}
                              onChange={(e) =>
                                setSettlementData({
                                  ...settlementData,
                                  notes: e.target.value,
                                })
                              }
                              placeholder="Additional notes..."
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsSettlementDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleSettlementSubmit}>
                              Process Settlement
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {transaction.settlement ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Settlement Number</Label>
                        <p className="font-medium">{transaction.settlement.settlementNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Settlement Date</Label>
                        <p className="font-medium">
                          {new Date(transaction.settlement.settlementDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Total Amount Due</Label>
                        <p className="font-medium">${transaction.settlement.totalAmountDue.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Paid Amount</Label>
                        <p className="font-medium text-green-600">
                          ${transaction.settlement.paidAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Discount Given</Label>
                        <p className="font-medium">${transaction.settlement.discountGiven.toFixed(2)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Outstanding Amount</Label>
                        <p className="font-medium text-red-600">
                          ${transaction.settlement.outstandingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : transaction.status === AgentTransactionStatus.RECONCILED ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      No settlement processed yet. Use the settlement button to process payment.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">
                      Settlement is only available after transaction reconciliation.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!transaction && (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No Transaction Selected</h3>
            <p className="text-gray-600 mb-4">
              Select a transaction from the list or create a new goods dispatch to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
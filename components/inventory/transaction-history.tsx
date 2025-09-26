'use client'

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryTransaction, TransactionType } from '@/types/inventory';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface TransactionHistoryProps {
  transactions: InventoryTransaction[];
  loading: boolean;
}

export function TransactionHistory({ transactions, loading }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(transaction =>
    transaction.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.item?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.location?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTransactionTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PURCHASE:
      case TransactionType.INITIAL_STOCK:
        return 'default';
      case TransactionType.SALE:
        return 'secondary';
      case TransactionType.ADJUSTMENT:
        return 'outline';
      case TransactionType.TRANSFER:
        return 'default';
      case TransactionType.DAMAGED:
      case TransactionType.EXPIRED:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatQuantity = (quantity: number, type: TransactionType) => {
    const sign = quantity > 0 ? '+' : '';
    return `${sign}${quantity}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          Recent inventory movements and adjustments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Balance After</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(transaction.createdAt).toString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.item?.name}</div>
                        <div className="text-sm text-muted-foreground font-mono">
                          {transaction.item?.sku}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.location?.name}</TableCell>
                    <TableCell>
                      <Badge variant={getTransactionTypeColor(transaction.type)}>
                        {transaction.type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatQuantity(transaction.quantity, transaction.type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${transaction.unitCost.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {transaction.balanceAfter}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.notes}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

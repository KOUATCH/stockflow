'use client'

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Package, TrendingDown, TrendingUp } from 'lucide-react';
import { useInventoryLevels, useLowStockItems, useInventoryTransactions } from '@/hooks/use-inventory';
import { InventoryLevelsTable } from './inventory-levels-table';
import { TransactionHistory } from './transaction-history';
import { StockAdjustmentForm } from './stock-adjustment-form';

export function InventoryDashboard() {
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const { levels, loading: levelsLoading, refetch: refetchLevels } = useInventoryLevels(selectedLocationId);
  const { lowStockItems, loading: lowStockLoading } = useLowStockItems(10);
  const { transactions, loading: transactionsLoading } = useInventoryTransactions();

  const totalItems = levels.length;
  const totalValue = levels.reduce((sum, level) => sum + level.totalValue, 0);
  const lowStockCount = lowStockItems.length;
  const totalQuantity = levels.reduce((sum, level) => sum + level.quantityOnHand, 0);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              Units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockCount > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>
              {lowStockCount} items are running low on stock
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item) => (
                <div key={`${item.itemId}-${item.locationId}`} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{item.item?.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      at {item.location?.name}
                    </span>
                  </div>
                  <Badge variant="destructive">
                    {item.quantityAvailable} left
                  </Badge>
                </div>
              ))}
              {lowStockCount > 5 && (
                <p className="text-sm text-muted-foreground">
                  And {lowStockCount - 5} more items...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="levels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels">Inventory Levels</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="adjustments">Stock Adjustments</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <InventoryLevelsTable 
            levels={levels} 
            loading={levelsLoading}
            onRefresh={refetchLevels}
          />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionHistory 
            transactions={transactions}
            loading={transactionsLoading}
          />
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          <StockAdjustmentForm onSuccess={refetchLevels} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

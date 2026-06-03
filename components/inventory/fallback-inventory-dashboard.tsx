'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, TrendingUp, RefreshCw, Plus } from 'lucide-react';
import { getInventoryLevelsClientSafe, getLowStockItemsClientSafe } from '@/actions/inventory/clientSafeInventoryData';
import type { InventoryLevel } from '@/types/inventory';

interface BasicItem {
  id: string;
  name: string;
  sku: string;
  costPrice: number;
  sellingPrice: number;
  imageUrls: string;
  createdAt: Date;
}

export function FallbackInventoryDashboard() {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryLevel[]>([]);
  const [basicItems, setBasicItems] = useState<BasicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInventoryTables, setHasInventoryTables] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch inventory data first
      const [levelsResult, lowStockResult] = await Promise.all([
        getInventoryLevelsClientSafe(),
        getLowStockItemsClientSafe(undefined, 10)
      ]);

      if (levelsResult.success) {
        setLevels(levelsResult.data || []);
        setHasInventoryTables(true);
      } else {
        // If inventory tables don't exist, fall back to basic items
        console.log("Inventory tables not available, falling back to basic items");
        setHasInventoryTables(false);
        
        // TODO: Implement getBasicItemsClientSafe if needed
        console.log("Basic items fallback not yet implemented with client-safe actions");
      }

      if (lowStockResult.success && lowStockResult.data) {
        setLowStockItems(lowStockResult.data);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalItems = hasInventoryTables ? levels.length : basicItems.length;
  const totalValue = hasInventoryTables 
    ? levels.reduce((sum, level) => sum + level.totalValue, 0)
    : basicItems.reduce((sum, item) => sum + (item.costPrice * 10), 0); // Estimate
  const lowStockCount = lowStockItems.length;
  const totalQuantity = hasInventoryTables 
    ? levels.reduce((sum, level) => sum + level.quantityOnHand, 0)
    : basicItems.length * 10; // Estimate

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Inventory</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Setup Notice */}
      {!hasInventoryTables && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Inventory System Setup</CardTitle>
            <CardDescription className="text-blue-600">
              Your inventory tracking system is not fully set up yet. You can still view your items, but advanced inventory features require additional database setup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="text-blue-700 border-blue-300">
              <Plus className="h-4 w-4 mr-2" />
              Set Up Inventory Tracking
            </Button>
          </CardContent>
        </Card>
      )}

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
              {hasInventoryTables ? 'Active inventory items' : 'Items in catalog'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasInventoryTables ? 'Total Value' : 'Estimated Value'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {hasInventoryTables ? 'Current inventory value' : 'Estimated catalog value'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasInventoryTables ? 'Total Quantity' : 'Estimated Quantity'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity}</div>
            <p className="text-xs text-muted-foreground">
              {hasInventoryTables ? 'Units in stock' : 'Estimated units'}
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

      {/* Items Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {hasInventoryTables ? 'Inventory Levels' : 'Items Catalog'}
              </CardTitle>
              <CardDescription>
                {hasInventoryTables 
                  ? 'Current stock levels across all locations'
                  : 'Your items catalog - set up inventory tracking for detailed stock management'
                }
              </CardDescription>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(hasInventoryTables ? levels.length === 0 : basicItems.length === 0) ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Items Found</h3>
              <p className="text-muted-foreground">
                Start by creating your first item.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {hasInventoryTables ? (
                levels.slice(0, 10).map((level) => (
                  <div key={`${level.itemId}-${level.locationId}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {level.item?.imageUrls?.[0] ? (
                          <img
                            src={level.item.imageUrls[0]}
                            alt={level.item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{level.item?.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {level.item?.sku} • {level.location?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{level.quantityOnHand} units</div>
                      <div className="text-sm text-muted-foreground">
                        ${level.totalValue.toFixed(2)} value
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                basicItems.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.imageUrls ? (
                          <img
                            src={item.imageUrls || "/placeholder.svg"}
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${item.costPrice.toFixed(2)} cost</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.sellingPrice.toFixed(2)} selling
                      </div>
                    </div>
                  </div>
                ))
              )}
              {(hasInventoryTables ? levels.length > 10 : basicItems.length > 10) && (
                <p className="text-center text-sm text-muted-foreground">
                  And {(hasInventoryTables ? levels.length : basicItems.length) - 10} more items...
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

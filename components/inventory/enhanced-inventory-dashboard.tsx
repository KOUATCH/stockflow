'use client'

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package, RefreshCw, Store, TrendingUp, Warehouse } from 'lucide-react';
import { useEffect, useState } from 'react';
// import { getInventoryLevels, getLowStockItems, getLocations } from '@/actions/inventory/get-inventory-data';
import { getInventoryLevels, getLocations, getLowStockItems } from '@/actions/inventory/get-inventory-data';
import { InventoryLevel, Location, LocationType } from '@/types/inventory';

export function EnhancedInventoryDashboard() {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [lowStockItems, setLowStockItems] = useState<InventoryLevel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [levelsResult, lowStockResult, locationsResult] = await Promise.all([
        getInventoryLevels(selectedLocationId || undefined),
        getLowStockItems(10),
        getLocations()
      ]);

      if (levelsResult.success && levelsResult.data) {
        setLevels(levelsResult.data);
      } else {
        setError(levelsResult.error || 'Failed to fetch inventory levels');
      }

      if (lowStockResult.success && lowStockResult.data) {
        setLowStockItems(lowStockResult.data);
      }

      if (locationsResult.success && locationsResult.data) {
        setLocations(locationsResult.data);
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
  }, [selectedLocationId]);

  const totalItems = levels.length;
  const totalValue = levels.reduce((sum, level) => sum + level.totalValue, 0);
  const lowStockCount = lowStockItems.length;
  const totalQuantity = levels.reduce((sum, level) => sum + level.quantityOnHand, 0);

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case LocationType.STORE:
        return <Store className="h-4 w-4" />;
      case LocationType.WAREHOUSE:
        return <Warehouse className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStockStatus = (level: InventoryLevel) => {
    if (level.quantityAvailable <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (level.quantityAvailable <= 10) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

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
      {/* Location Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Location Filter</CardTitle>
          <CardDescription>
            Filter inventory by location or view all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedLocationId === '' ? 'default' : 'outline'}
              onClick={() => setSelectedLocationId('')}
              size="sm"
            >
              All Locations
            </Button>
            {locations.map((location) => (
              <Button
                key={location.id}
                variant={selectedLocationId === location.id ? 'default' : 'outline'}
                onClick={() => setSelectedLocationId(location.id)}
                size="sm"
                className="flex items-center gap-2"
              >
                {getLocationIcon(location.type)}
                {location.name}
                {location.isDefault && <Badge variant="secondary" className="ml-1 text-xs">Default</Badge>}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
              {selectedLocationId ? `At selected location` : 'Across all locations'}
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.item?.name}</span>
                    <span className="text-sm text-muted-foreground">
                      at {item.location?.name}
                    </span>
                    {getLocationIcon(item.location?.type || LocationType.WAREHOUSE)}
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

      {/* Inventory Levels */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>
                Current stock levels {selectedLocationId ? 'at selected location' : 'across all locations'}
              </CardDescription>
            </div>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {levels.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Inventory Items</h3>
              <p className="text-muted-foreground">
                {selectedLocationId
                  ? 'No items found at the selected location.'
                  : 'Start by creating your first item with initial inventory.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {levels.map((level) => {
                const status = getStockStatus(level);
                return (
                  <div key={`${level.itemId}-${level.locationId}`} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {level.item?.imageUrls ? (
                          <img
                            src={level.item.imageUrls || "/placeholder.svg"}
                            alt={level.item.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{level.item?.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>SKU: {level.item?.sku}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {getLocationIcon(level.location?.type || LocationType.WAREHOUSE)}
                            <span>{level.location?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{level.quantityOnHand} units</span>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Available: {level.quantityAvailable} • Reserved: {level.quantityReserved}
                      </div>
                      <div className="text-sm font-medium">
                        ${level.totalValue.toFixed(2)} value
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

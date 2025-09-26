'use client'

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search } from 'lucide-react';
import { InventoryLevel } from '@/types/inventory';

interface InventoryLevelsTableProps {
  levels: InventoryLevel[];
  loading: boolean;
  onRefresh: () => void;
}

export function InventoryLevelsTable({ levels, loading, onRefresh }: InventoryLevelsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLevels = levels.filter(level =>
    level.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.item?.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.location?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (level: InventoryLevel) => {
    if (level.quantityAvailable <= 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (level.quantityAvailable <= 10) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Levels</CardTitle>
            <CardDescription>
              Current stock levels across all locations
            </CardDescription>
          </div>
          <Button onClick={onRefresh} disabled={loading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items, SKUs, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">On Hand</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading inventory levels...
                  </TableCell>
                </TableRow>
              ) : filteredLevels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    No inventory levels found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLevels.map((level) => {
                  const status = getStockStatus(level);
                  return (
                    <TableRow key={`${level.itemId}-${level.locationId}`}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {level.item?.imageUrls && (
                            <img
                              src={level.item.imageUrls || "/placeholder.svg"}
                              alt={level.item.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          )}
                          <span className="font-medium">{level.item?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {level.item?.sku}
                      </TableCell>
                      <TableCell>{level.location?.name}</TableCell>
                      <TableCell className="text-right font-mono">
                        {level.quantityOnHand}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {level.quantityReserved}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {level.quantityAvailable}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        ${level.totalValue.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

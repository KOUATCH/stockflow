'use client'

import { notify } from "@/lib/notifications/notify"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adjustStock } from '@/actions/inventory/adjust-stock';
import { StockAdjustmentData } from '@/types/inventory';

interface StockAdjustmentFormProps {
  onSuccess: () => void;
}

export function StockAdjustmentForm({ onSuccess }: StockAdjustmentFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue, watch } = useForm<StockAdjustmentData>();

  const onSubmit = async (data: StockAdjustmentData) => {
    setLoading(true);
    try {
      const result = await adjustStock([data]);
      
      if (result.success) {
        notify({
          title: "Stock Adjusted",
          description: "Inventory levels have been updated successfully.",
        });
        reset();
        onSuccess();
      } else {
        notify({
          title: "Error",
          description: result.error || "Failed to adjust stock",
          variant: "destructive",
        });
      }
    } catch (error) {
      notify({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Adjustment</CardTitle>
        <CardDescription>
          Adjust inventory levels for items across locations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itemId">Item</Label>
              <Select onValueChange={(value) => setValue('itemId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item" />
                </SelectTrigger>
                <SelectContent>
                  {/* You'll need to fetch and populate items here */}
                  <SelectItem value="item1">Sample Item 1</SelectItem>
                  <SelectItem value="item2">Sample Item 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationId">Location</Label>
              <Select onValueChange={(value) => setValue('locationId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {/* You'll need to fetch and populate locations here */}
                  <SelectItem value="location1">Main Warehouse</SelectItem>
                  <SelectItem value="location2">Store Front</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentQuantity">Adjustment Quantity</Label>
              <Input
                id="adjustmentQuantity"
                type="number"
                placeholder="Enter quantity (+ or -)"
                {...register('adjustmentQuantity', { 
                  required: true,
                  valueAsNumber: true 
                })}
              />
              <p className="text-sm text-muted-foreground">
                Use positive numbers to add stock, negative to remove
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost (optional)</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('unitCost', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Reason for adjustment..."
              {...register('notes')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number (optional)</Label>
              <Input
                id="batchNumber"
                placeholder="Batch number"
                {...register('batchNumber')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date (optional)</Label>
              <DatePicker
                date={watch('expiryDate') ? new Date(watch('expiryDate')) : undefined}
                onDateChange={(date) => setValue('expiryDate', date?.toISOString().split('T')[0] || '')}
                placeholder="Select expiry date"
                minDate={new Date()} // Can't expire in the past
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Processing...' : 'Adjust Stock'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

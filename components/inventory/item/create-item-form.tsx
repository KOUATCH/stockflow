'use client'

import { notify } from "@/lib/notifications/notify"
import { getLocationsClientSafe } from '@/actions/inventory/clientSafeInventoryData';
import { createItemWithInventory } from '@/actions/itemsShow/create-item-with-inventory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ItemCreateWithInventoryDTO, Location } from '@/types/inventory';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export function CreateItemForm({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ItemCreateWithInventoryDTO>();

  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      const result = await getLocationsClientSafe();
      if (result.success && result.data) {
        setLocations(result.data);
      }
    };
    fetchLocations();
  }, []);

  const onSubmit = async (data: ItemCreateWithInventoryDTO) => {
    setLoading(true);
    try {
      const result = await createItemWithInventory(data);

      if (result.success) {
        notify({
          title: "Item Created",
          description: `${data.nameEn} has been created successfully with initial inventory.`,
        });
        reset();
        onSuccess?.();
      } else {
        notify({
          title: "Error",
          description: result.error || "Failed to create item",
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Item</CardTitle>
        <CardDescription>
          Add a new item to your inventory with initial stock levels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Item Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Item Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nameEn">English Item Name *</Label>
                <Input
                  id="nameEn"
                  {...register('nameEn', { required: 'English item name is required' })}
                  placeholder="Enter item name"
                />
                {errors.nameEn && (
                  <p className="text-sm text-destructive">{errors.nameEn.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nameFr">French Item Name</Label>
                <Input
                  id="nameFr"
                  {...register('nameFr')}
                  placeholder="Enter French item name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register('sku')}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  {...register('costPrice', {
                    required: 'Cost price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cost price must be positive' }
                  })}
                  placeholder="0.00"
                />
                {errors.costPrice && (
                  <p className="text-sm text-destructive">{errors.costPrice.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  {...register('sellingPrice', {
                    required: 'Selling price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Selling price must be positive' }
                  })}
                  placeholder="0.00"
                />
                {errors.sellingPrice && (
                  <p className="text-sm text-destructive">{errors.sellingPrice.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionEn">English Description</Label>
              <Textarea
                id="descriptionEn"
                {...register('descriptionEn')}
                placeholder="Item description (optional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descriptionFr">French Description</Label>
              <Textarea
                id="descriptionFr"
                {...register('descriptionFr')}
                placeholder="French item description (optional)"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Initial Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Initial Inventory</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="locationId">Location *</Label>
                <Select onValueChange={(value) => setValue('locationId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="initialQuantity">Initial Quantity</Label>
                <Input
                  id="initialQuantity"
                  type="number"
                  {...register('initialQuantity', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Quantity must be positive' }
                  })}
                  placeholder="0"
                />
                {errors.initialQuantity && (
                  <p className="text-sm text-destructive">{errors.initialQuantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (for inventory valuation)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  {...register('unitCost', { valueAsNumber: true })}
                  placeholder="Uses cost price if empty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Batch Number</Label>
                <Input
                  id="batchNumber"
                  {...register('batchNumber')}
                  placeholder="Optional batch number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Notes about the initial stock (optional)"
                rows={2}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creating Item...' : 'Create Item'}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

'use client';

// components/dashboard/items/others/BasicInfoTab2.tsx
import { notify } from "@/lib/notifications/notify"
import { updateItemById } from '@/actions/itemsShow/updateItemById';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AuthenticatedUser } from '@/config/useAuth';
import { ItemDTO } from '@/types/itemTypes';
import { Loader2, Save } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
// Server action imports (you'll need to create these)
// import { getItemCategories } from '@/app/actions/categories';
// import { getItemSuppliers } from '@/app/actions/suppliers';
// import { updateItemBasicInfo } from '@/app/actions/items';
// import { getItemCategories, getItemSuppliers, updateItemBasicInfo } from '@/actions/items';
interface BasicInfoTab2Props {
  itemData: ItemDTO;
  itemId: string;
  params: Promise<{ itemId: string }>;
  user: AuthenticatedUser;
  onUpdate: (data: Partial<ItemDTO>) => void;
  loading: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

export default function BasicInfoTabFinal({
  itemData,
  itemId,
  params,
  user,
  onUpdate,
  loading: parentLoading
}: BasicInfoTab2Props) {
  const [formData, setFormData] = useState({
    name: itemData.name || '',
    description: itemData.description || '',
    sku: itemData.sku || '',
    barcode: itemData.barcode || '',
    categoryId: itemData.categoryId || '',
    // supplierId: itemData.supplierId || '',
    // brand: itemData.brand || '',
    // model: itemData.model || '',
    weight: itemData.weight || '',
    dimensions: itemData.dimensions || '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [resolvedParams, setResolvedParams] = useState<{ itemId: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Resolve params on mount
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolved = await params;
        setResolvedParams(resolved);
      } catch (error) {
        console.error('Error resolving params:', error);
        notify("Failed to resolve page parameters")

      }
    };

    resolveParams();
  }, [params]);

  // // Load categories and suppliers using server actions
  // useEffect(() => {
  //   const loadData = async () => {
  //     if (!resolvedParams) return;

  //     try {
  //       setIsDataLoading(true);

  //       // Use server actions to fetch data
  //       const [categoriesResult, suppliersResult] = await Promise.all([
  //         getItemCategories(user.id),
  //         getItemSuppliers(user.id)
  //       ]);

  //       if (categoriesResult.success) {
  //         setCategories(categoriesResult.data || []);
  //       } else {
  //         console.error('Failed to load categories:', categoriesResult.error);
  //         notify({
  //           title: "Warning",
  //           description: "Failed to load categories",
  //           variant: "destructive",
  //         });
  //       }

  //       if (suppliersResult.success) {
  //         setSuppliers(suppliersResult.data || []);
  //       } else {
  //         console.error('Failed to load suppliers:', suppliersResult.error);
  //         notify({
  //           title: "Warning",
  //           description: "Failed to load suppliers",
  //           variant: "destructive",
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Error loading data:', error);
  //       notify({
  //         title: "Error",
  //         description: "Failed to load form data",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsDataLoading(false);
  //     }
  //   };

  //   loadData();
  // }, [resolvedParams, user.id]);

  // Update form data when itemData changes
  useEffect(() => {
    setFormData({
      name: itemData.name || '',
      description: itemData.description || '',
      sku: itemData.sku || '',
      barcode: itemData.barcode || '',
      categoryId: itemData.categoryId || '',
      // supplierId: itemData.supplierId || '',
      // brand: itemData.brand || '',
      // model: itemData.model || '',
      weight: itemData.weight || '',
      dimensions: itemData.dimensions || '',
    });
  }, [itemData]);

  const handleInputChange = useCallback((field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleSelectChange = useCallback((field: keyof typeof formData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!resolvedParams) {
      notify("Page parameters not loaded");
      return;
    }

    startTransition(async () => {
      try {
        // Use server action to update item
        const result = await updateItemById({ id: resolvedParams.itemId, data: {
          ...formData,
          slug: itemData.slug ?? '',
          costPrice: itemData.costPrice ?? null,
          sellingPrice: itemData.sellingPrice ?? null,
          organizationId: user.id,
          createdAt: undefined,
          thumbnail: null,
          imageUrls: []
        }});

        if (result.success) {
          // Call parent update function
          onUpdate({
            ...formData,
            weight:
              formData.weight === ''
                ? null
                : isNaN(Number(formData.weight))
                  ? undefined
                  : Number(formData.weight),
          });

          notify.success("Basic information updated successfully");
        } else {
          throw new Error(result.error?.message || 'Failed to update item');
        }
      } catch (error) {
        console.error('Save error:', error);
        notify.error(error instanceof Error ? error.message : "Failed to save changes");
      }
    });
  }, [formData, resolvedParams, user.id, onUpdate]);

  // Check if form has unsaved changes
  const hasChanges = useCallback(() => {
    return Object.keys(formData).some(key => {
      const formKey = key as keyof typeof formData;
      return formData[formKey] !== (itemData[formKey as keyof ItemDTO] || '');
    });
  }, [formData, itemData]);

  const isLoading = parentLoading || isPending || isDataLoading;

  if (!resolvedParams) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading page data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <div className="text-sm text-gray-500">
          Item ID: {resolvedParams.itemId}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleInputChange('name')}
              placeholder="Enter item name"
              disabled={isLoading}
              required
            />
          </div>

          {/* SKU */}
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={handleInputChange('sku')}
              placeholder="Enter SKU"
              disabled={isLoading}
            />
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={handleInputChange('barcode')}
              placeholder="Enter barcode"
              disabled={isLoading}
            />
          </div>

          {/* Brand */}
          {/* <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={handleInputChange('brand')}
              placeholder="Enter brand"
              disabled={isLoading}
            />
          </div> */}

          {/* Model */}
          {/* <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={formData.model}
              onChange={handleInputChange('model')}
              placeholder="Enter model"
              disabled={isLoading}
            />
          </div> */}

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight">Weight</Label>
            <Input
              id="weight"
              value={formData.weight}
              onChange={handleInputChange('weight')}
              placeholder="Enter weight (e.g., 1.5kg)"
              disabled={isLoading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId}
              onValueChange={handleSelectChange('categoryId')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier */}
          {/* <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Select
              value={formData.supplierId}
              onValueChange={handleSelectChange('supplierId')}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Enter item description"
            rows={4}
            disabled={isLoading}
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Input
            id="dimensions"
            value={formData.dimensions}
            onChange={handleInputChange('dimensions')}
            placeholder="Enter dimensions (e.g., 10x5x3 cm)"
            disabled={isLoading}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || !hasChanges()}
            className="flex items-center space-x-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{isPending ? 'Saving...' : 'Save Changes'}</span>
          </Button>
        </div>

        {hasChanges() && !isPending && (
          <div className="text-sm text-orange-600 text-center">
            You have unsaved changes
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import getOrgItems from '@/actions/itemsShow/getOrgItems';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';
import { BriefItemPayload, BriefItemResponse } from '@/types/item';
import { zodResolver } from '@hookform/resolvers/zod';
import { Hash, Loader2, Package, Ruler, Save, Tag, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Validation schemas for each card
const productIdentitySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  slug: z.string().min(1, 'URL slug is required'),
  barcode: z.string().optional(),
});

const productCodesSchema = z.object({
  upc: z.string().optional(),
  ean: z.string().optional(),
  mpn: z.string().optional(),
  isbn: z.string().optional(),
});

const physicalPropertiesSchema = z.object({
  dimensions: z.string().optional(),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  unitOfMeasure: z.string().optional(),
});

const descriptionStatusSchema = z.object({
  description: z.string().optional(),
  isActive: z.boolean(),
  isSerialTracked: z.boolean(),
});

interface ItemData {
  id: string;
  name: string;
  imageUrls: string[];
  slug: string;
  thumbnail?: string;
  sku: string;
  barcode?: string;
  description?: string;
  dimensions?: string;
  weight?: number;
  upc?: string;
  ean?: string;
  mpn?: string;
  isbn?: string;
  unitOfMeasure?: string;
  isActive: boolean;
  isSerialTracked: boolean;
}

interface BasicInfoTabProps {
  itemData: ItemData;
  onUpdate: (data: Partial<ItemData>) => void;
}

import { FieldValues, UseFormReturn } from 'react-hook-form';

import { DefaultValues } from 'react-hook-form';

interface UpdateCardProps<T extends FieldValues> {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  schema: z.ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onUpdate: (data: T) => void;
  className?: string;
  isLoading?: boolean;
  children: (form: UseFormReturn<T>) => React.ReactNode;
}

function UpdateCard<T extends FieldValues>({
  title,
  icon: Icon,
  schema,
  defaultValues,
  onUpdate,
  className = "",
  isLoading = false,
  children
}: UpdateCardProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = useCallback(async (data: T) => {
    setIsSubmitting(true);
    try {
      await onUpdate(data);
      form.reset(data); // Reset form with new values
    } catch (error) {
      console.error('Failed to update:', error);
      // You might want to show a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [onUpdate, form]);

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Card className={`${className} ${isLoading ? 'opacity-50' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
        <Button
          type="submit"
          form={`form-${title.toLowerCase().replace(/\s+/g, '-')}`}
          disabled={!form.formState.isDirty || isSubmitting || isLoading}
          size="sm"
          className="flex items-center space-x-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSubmitting ? 'Updating...' : 'Update'}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form
              id={`form-${title.toLowerCase().replace(/\s+/g, '-')}`}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {children(form)}
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

export default function BasicInfoTab({ itemData, onUpdate }: BasicInfoTabProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(itemData.imageUrls || []);
  const [orgItems, setOrgItems] = useState<BriefItemPayload[]>([]);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unit of measure options
  const unitOptions = [
    { value: 'pieces', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'liters', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'meters', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'packs', label: 'Packs' },
  ];

  // Fetch user and organization items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get authenticated user
        const authenticatedUser = await getAuthenticatedUser();
        setUser(authenticatedUser);

        if (authenticatedUser?.organizationId) {
          // Fetch organization items
          const response: BriefItemResponse = await getOrgItems(authenticatedUser.organizationId);

          if (response.data) {
            setOrgItems(response.data);
          } else {
            setError('No items found for this organization');
          }
        } else {
          setError('User organization not found');
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update image URLs when itemData changes
  useEffect(() => {
    setImageUrls(itemData.imageUrls || []);
  }, [itemData.imageUrls]);

  const handleImageUpload = useCallback((urls: string[]) => {
    const newUrls = [...imageUrls, ...urls];
    setImageUrls(newUrls);
    onUpdate({ imageUrls: newUrls });
  }, [imageUrls, onUpdate]);

  const handleImageRemove = useCallback((index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    onUpdate({ imageUrls: newUrls });
  }, [imageUrls, onUpdate]);

  const handleThumbnailUpdate = useCallback((url: string) => {
    onUpdate({ thumbnail: url });
  }, [onUpdate]);

  // Enhanced update function with error handling
  const handleUpdate = useCallback(async (data: Partial<ItemData>) => {
    try {
      await onUpdate(data);
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }, [onUpdate]);

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Identity Card */}
      <UpdateCard
        title="Product Identity"
        icon={Tag}
        schema={productIdentitySchema}
        defaultValues={{
          name: itemData.name,
          sku: itemData.sku,
          slug: itemData.slug,
          barcode: itemData.barcode || '',
        }}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter URL slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </UpdateCard>

      {/* Product Codes Card */}
      <UpdateCard
        title="Product Codes"
        icon={Hash}
        schema={productCodesSchema}
        defaultValues={{
          upc: itemData.upc || '',
          ean: itemData.ean || '',
          mpn: itemData.mpn || '',
          isbn: itemData.isbn || '',
        }}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="upc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UPC</FormLabel>
                  <FormControl>
                    <Input placeholder="12-digit UPC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ean"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EAN</FormLabel>
                  <FormControl>
                    <Input placeholder="13-digit EAN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mpn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MPN</FormLabel>
                  <FormControl>
                    <Input placeholder="Manufacturing Part Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isbn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ISBN</FormLabel>
                  <FormControl>
                    <Input placeholder="13-digit ISBN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </UpdateCard>

      {/* Physical Properties Card */}
      <UpdateCard
        title="Physical Properties"
        icon={Ruler}
        schema={physicalPropertiesSchema}
        defaultValues={{
          dimensions: itemData.dimensions || '',
          weight: itemData.weight || 0,
          unitOfMeasure: itemData.unitOfMeasure || '',
        }}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="dimensions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dimensions</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10x10x10 cm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Weight in kg"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitOfMeasure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit of Measure</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit of measure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </UpdateCard>

      {/* Description & Status Card */}
      <UpdateCard
        title="Description & Status"
        icon={Package}
        schema={descriptionStatusSchema}
        defaultValues={{
          description: itemData.description || '',
          isActive: itemData.isActive,
          isSerialTracked: itemData.isSerialTracked,
        }}
        onUpdate={handleUpdate}
        isLoading={isLoading}
      >
        {(form) => (
          <>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter product description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable this product for use in the system
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSerialTracked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Serial Tracking</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Track individual serial numbers for this product
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </>
        )}
      </UpdateCard>

      {/* Image Management Card - Full Width */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-primary" />
            <span>Image Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Thumbnail */}
              <div>
                <Label>Thumbnail</Label>
                <div className="mt-2">
                  {itemData.thumbnail ? (
                    <div className="relative inline-block">
                      <img
                        src={itemData.thumbnail}
                        alt="Thumbnail"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => handleThumbnailUpdate('')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <span className="text-sm text-gray-500">No thumbnail</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Image Gallery */}
              <div>
                <Label>Product Images</Label>
                <div className="mt-2 space-y-4">
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border transition-all group-hover:opacity-75"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleImageRemove(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Zone Placeholder */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Drag and drop images here, or click to select files</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                    {/* Uncomment when UploadDropzone is available */}
                    {/* <UploadDropzone
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        const urls = res.map(file => file.url);
                        handleImageUpload(urls);
                      }}
                      onUploadError={(error: Error) => {
                        console.error('Upload error:', error);
                      }}
                    /> */}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Information (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>User:</strong> {user?.organizationId || 'Not loaded'}</p>
              <p><strong>Org Items Count:</strong> {orgItems.length}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Error:</strong> {error || 'None'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
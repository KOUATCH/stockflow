"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateSupplierBasicInfo, useUpdateSupplierDetails, useUpdateSupplierRelations } from "@/hooks/useAllSupplierQueries";
import { SupplierDTO } from "@/types/supplier";
import { TaxRateDTO } from "@/types/taxRates";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building,
  Calendar,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  Tag,
  Warehouse
} from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Import your custom hooks here
// import { useUpdateSupplierBasicInfo, useUpdateSupplierRelations } from "@/hooks/useAllSupplierQueries";

interface SupplierDetailProps {
  title: string;
  editingId: string;
  organizationId: string;
  initialData?: SupplierDTO[];
  initialTaxRateData: TaxRateDTO[];
}

// Schema definitions
const supplierBasicInfoSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  contactPerson: z.string().min(1, "Contact person is required").optional(),
  createdAt: z.date(),
  organizationId: z.string(),
});

const supplierDetailsSchema = z.object({
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.number().min(0, "Payment terms must be positive").optional(),
});

const supplierRelationsSchema = z.object({
  taxId: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

// Type definitions
type BasicInfoFormValues = z.infer<typeof supplierBasicInfoSchema>;
type RelationsFormValues = z.infer<typeof supplierRelationsSchema>;
type DetailsFormValues = z.infer<typeof supplierDetailsSchema>;

interface ComprehensiveSupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierData?: SupplierDTO | null;
  onSuccess?: () => void;
  initialTaxRateData: TaxRateDTO[];
  title: string;

}

export default function SupplierFormForEditing({
  open,
  onOpenChange,
  supplierData,
  onSuccess,
  title,
  initialTaxRateData
}: ComprehensiveSupplierFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  Uncomment these when you have the hooks available
  const updateSupplierBasicInfoMutation = useUpdateSupplierBasicInfo();
  const updateSupplierRelationsMutation = useUpdateSupplierRelations();
  const updateSupplierDetailsMutation = useUpdateSupplierDetails();


  // Helper function to safely get values from supplierData
  const getSupplierValue = (key: keyof SupplierDTO, defaultValue: any = "") => {
    if (!supplierData) return defaultValue;
    const value = supplierData[key];
    return value !== undefined && value !== null ? value : defaultValue;
  };

  // Form configurations
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(supplierBasicInfoSchema),
    defaultValues: {
      name: "",
      contactPerson: "",
      organizationId: "",
    },
  });

  const supplierDetailsForm = useForm<DetailsFormValues>({
    resolver: zodResolver(supplierDetailsSchema),
    defaultValues: {
      email: "",
      address: "",
      paymentTerms: 0,
      phone: "",
    },
  });

  const supplierRelationsForm = useForm<RelationsFormValues>({
    resolver: zodResolver(supplierRelationsSchema),
    defaultValues: {
      taxId: "",
      notes: "",
      isActive: true,
    },
  });

  // Tax rate options
  const taxRateOptions = initialTaxRateData?.map(taxRate => ({
    label: taxRate.taxRateName,
    value: taxRate.id
  })) || [];

  // Effect to populate forms when supplierData changes
  useEffect(() => {
    if (supplierData && open) {
      console.log("Populating forms with supplier data:", supplierData);

      // Reset and populate basic info form
      basicInfoForm.reset({
        name: getSupplierValue("name", ""),
        organizationId: getSupplierValue("organizationId", ""),
        contactPerson: getSupplierValue("contactPerson", ""),
      });

      // Reset and populate supplier details form
      supplierDetailsForm.reset({
        email: getSupplierValue("email", ""),
        address: getSupplierValue("address", ""),
        paymentTerms: Number(getSupplierValue("paymentTerms", 0)),
        phone: getSupplierValue("phone", ""),
      });

      // Reset and populate relations form
      supplierRelationsForm.reset({
        notes: getSupplierValue("notes", ""),
        taxId: getSupplierValue("taxId", ""),
        isActive: Boolean(getSupplierValue("isActive", true)),
      });
    }
  }, [supplierData, open, basicInfoForm, supplierDetailsForm, supplierRelationsForm]);

  // Form submission handlers
  const handleSupplierBasicInfoSubmit = async (data: BasicInfoFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating basic info:", { ...data, supplierId: supplierData?.id });

      if (!supplierData) {
        toast.error("Supplier data is missing. Cannot update supplier.");
        return;
      }

      const updateData = {
        ...data,
        id: supplierData.id,
      };

      // Uncomment when hook is available
      updateSupplierBasicInfoMutation.mutate(
        {
          id: supplierData.id,
          data: updateData,
        },
        {
          onSuccess: async () => {
            toast.success("Supplier updated successfully");
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error("Failed to update supplier", {
              description: error?.message || "Unknown error occurred",
            });
          },
        }
      );

      // Temporary success message
      toast.success("Supplier basic info updated successfully");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update basic information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSupplierDetailsSubmit = async (data: DetailsFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating supplier details:", { ...data, supplierId: supplierData?.id });

      if (!supplierData) {
        toast.error("Supplier data is missing. Cannot update supplier details.");
        return;
      }

      const updateData = {
        ...data,
        id: supplierData.id,
      };

      // Uncomment when hook is available
      updateSupplierDetailsMutation.mutate(
        {
          id: supplierData.id,
          data: updateData,
        },
        {
          onSuccess: async () => {
            toast.success("Supplier details updated successfully");
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error("Failed to update supplier details", {
              description: error?.message || "Unknown error occurred",
            });
          },
        }
      );

      // Temporary success message
      toast.success("Supplier details updated successfully");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update supplier details information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRelationsSubmit = async (data: RelationsFormValues) => {
    setIsSubmitting(true);
    try {
      console.log("Updating supplier relations info:", { ...data, supplierId: supplierData?.id });

      if (!supplierData) {
        toast.error("Supplier relations data is missing. Cannot update supplier.");
        return;
      }

      const updateData = {
        ...data,
        id: supplierData.id,
      };

      // Uncomment when hook is available
      updateSupplierRelationsMutation.mutate(
        {
          id: supplierData.id,
          data: updateData,
        },
        {
          onSuccess: async () => {
            toast.success("Supplier relations updated successfully");
            onSuccess?.();
          },
          onError: (error: any) => {
            toast.error("Failed to update supplier relations", {
              description: error?.message || "Unknown error occurred",
            });
          },
        }
      );

      // Temporary success message
      toast.success("Supplier relations updated successfully");
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to update supplier relations information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Edit Supplier: {getSupplierValue("name", "Unknown Supplier")}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="relations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Relations
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>Essential supplier details and description</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...basicInfoForm}>
                  <form onSubmit={basicInfoForm.handleSubmit(handleSupplierBasicInfoSubmit)} className="space-y-4">
                    <FormField
                      control={basicInfoForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter supplier name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={basicInfoForm.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter supplier contact person"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Updating..." : "Update Basic Info"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Supplier Details
                </CardTitle>
                <CardDescription>Contact information and payment terms</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...supplierDetailsForm}>
                  <form onSubmit={supplierDetailsForm.handleSubmit(handleSupplierDetailsSubmit)} className="space-y-4">
                    <FormField
                      control={supplierDetailsForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="email"
                                placeholder="Enter email address"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierDetailsForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="tel"
                                placeholder="Enter phone number"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierDetailsForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Textarea
                                placeholder="Enter supplier address"
                                className="pl-10 min-h-[80px]"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierDetailsForm.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Terms (days)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                min="0"
                                step="1"
                                placeholder="30"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Updating..." : "Update Supplier Details"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Relations Tab */}
          <TabsContent value="relations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Relations
                </CardTitle>
                <CardDescription>Tax information and additional settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...supplierRelationsForm}>
                  <form onSubmit={supplierRelationsForm.handleSubmit(handleRelationsSubmit)} className="space-y-4">
                    <FormField
                      control={supplierRelationsForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active Status</FormLabel>
                            <FormDescription>Enable or disable this supplier</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierRelationsForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Rate</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select tax rate" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  {taxRateOptions.map((taxRate) => (
                                    <SelectItem key={taxRate.value} value={taxRate.value}>
                                      {taxRate.label}
                                    </SelectItem>
                                  ))}
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={supplierRelationsForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter additional notes about this supplier"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Updating..." : "Update Relations"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
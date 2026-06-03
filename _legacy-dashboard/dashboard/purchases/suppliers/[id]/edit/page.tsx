import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  Save,
  X,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  CreditCard,
  Star,
  Shield,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

interface EditSupplierPageProps {
  params: {
    id: string;
  };
}

// Mock supplier data for editing
const mockSupplierData = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001",
  email: "sales@techcorp.com",
  phone: "+1-555-123-4567",
  website: "https://www.techcorp.com",
  status: "active",
  category: "technology",
  isPreferred: true,
  isVerified: true,
  taxId: "TC-TAX-001",
  registrationNumber: "REG-TC-123456",
  address: {
    street: "123 Innovation Drive",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    country: "USA"
  },
  primaryContact: {
    name: "John Smith",
    title: "Sales Manager",
    email: "john.smith@techcorp.com",
    phone: "+1-555-123-4568"
  },
  billingContact: {
    name: "Sarah Johnson",
    title: "Accounts Manager",
    email: "sarah.johnson@techcorp.com",
    phone: "+1-555-123-4569"
  },
  paymentTerms: 30,
  creditLimit: 50000,
  currency: "USD",
  shippingTerms: "FOB",
  description: "Leading technology supplier specializing in electronics and IT equipment.",
  documents: [
    { id: "doc_1", name: "Business License", type: "license", uploadedAt: new Date("2024-01-15") },
    { id: "doc_2", name: "Tax Certificate", type: "tax", uploadedAt: new Date("2024-02-01") }
  ]
};

const supplierCategories = [
  { value: "technology", label: "Technology" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "wholesale", label: "Wholesale" },
  { value: "services", label: "Services" },
  { value: "materials", label: "Raw Materials" },
  { value: "equipment", label: "Equipment" }
];

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" }
];

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to edit suppliers.</p>
          </div>
        </div>
      </div>
    );
  }

  const supplier = mockSupplierData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/purchases/suppliers/${params.id}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Details
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  Edit Supplier
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {supplier.name} ({supplier.code})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex gap-2">
            {supplier.isVerified && (
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
            {supplier.isPreferred && (
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300">
                <Star className="w-3 h-3 mr-1" />
                Preferred
              </Badge>
            )}
            <Badge variant={supplier.status === "active" ? "default" : "secondary"}>
              {supplier.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form - Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      defaultValue={supplier.name}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplierCode">Supplier Code *</Label>
                    <Input
                      id="supplierCode"
                      defaultValue={supplier.code}
                      placeholder="Enter supplier code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={supplier.email}
                      placeholder="supplier@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      defaultValue={supplier.phone}
                      placeholder="+1-555-123-4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      defaultValue={supplier.website}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select defaultValue={supplier.category}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {supplierCategories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    defaultValue={supplier.description}
                    placeholder="Brief description of the supplier"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      defaultValue={supplier.taxId}
                      placeholder="Tax identification number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regNumber">Registration Number</Label>
                    <Input
                      id="regNumber"
                      defaultValue={supplier.registrationNumber}
                      placeholder="Business registration number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    defaultValue={supplier.address.street}
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      defaultValue={supplier.address.city}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      defaultValue={supplier.address.state}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                    <Input
                      id="zipCode"
                      defaultValue={supplier.address.zipCode}
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    defaultValue={supplier.address.country}
                    placeholder="Country"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Primary Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryName">Full Name</Label>
                      <Input
                        id="primaryName"
                        defaultValue={supplier.primaryContact.name}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryTitle">Title</Label>
                      <Input
                        id="primaryTitle"
                        defaultValue={supplier.primaryContact.title}
                        placeholder="Job title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryEmail">Email</Label>
                      <Input
                        id="primaryEmail"
                        type="email"
                        defaultValue={supplier.primaryContact.email}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryPhone">Phone</Label>
                      <Input
                        id="primaryPhone"
                        defaultValue={supplier.primaryContact.phone}
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Contact */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Billing Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingName">Full Name</Label>
                      <Input
                        id="billingName"
                        defaultValue={supplier.billingContact.name}
                        placeholder="Billing contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingTitle">Title</Label>
                      <Input
                        id="billingTitle"
                        defaultValue={supplier.billingContact.title}
                        placeholder="Job title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingEmail">Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        defaultValue={supplier.billingContact.email}
                        placeholder="billing@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billingPhone">Phone</Label>
                      <Input
                        id="billingPhone"
                        defaultValue={supplier.billingContact.phone}
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Status & Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Status & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Active Status
                  </Label>
                  <Switch
                    id="status"
                    defaultChecked={supplier.status === "active"}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="preferred" className="text-sm font-medium">
                    Preferred Supplier
                  </Label>
                  <Switch
                    id="preferred"
                    defaultChecked={supplier.isPreferred}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="verified" className="text-sm font-medium">
                    Verified Supplier
                  </Label>
                  <Switch
                    id="verified"
                    defaultChecked={supplier.isVerified}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Financial Terms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Financial Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    defaultValue={supplier.paymentTerms}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    defaultValue={supplier.creditLimit}
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue={supplier.currency}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingTerms">Shipping Terms</Label>
                  <Input
                    id="shippingTerms"
                    defaultValue={supplier.shippingTerms}
                    placeholder="FOB, EXW, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    PDF, DOC, DOCX up to 10MB
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Browse Files
                  </Button>
                </div>

                {/* Existing Documents */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Existing Documents</Label>
                  {supplier.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded flex items-center justify-center">
                          <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
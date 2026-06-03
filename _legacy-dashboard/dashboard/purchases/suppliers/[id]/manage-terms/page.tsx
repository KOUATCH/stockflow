import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  Save,
  X,
  CreditCard,
  Truck,
  Calendar,
  Percent,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Plus,
  Trash2,
  Info
} from "lucide-react";
import Link from "next/link";

interface ManageTermsPageProps {
  params: {
    id: string;
  };
}

// Mock supplier terms data
const mockSupplierTerms = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001",
  paymentTerms: {
    standardTerms: 30,
    currency: "USD",
    creditLimit: 50000,
    currentBalance: 8420.50,
    earlyPaymentDiscount: {
      enabled: true,
      discountRate: 2.5,
      daysToQualify: 10,
      description: "2.5% discount if paid within 10 days"
    },
    latePaymentPenalty: {
      enabled: true,
      penaltyRate: 1.5,
      gracePeriod: 5,
      description: "1.5% monthly penalty after 5-day grace period"
    },
    autoPayment: false
  },
  shippingTerms: {
    defaultMethod: "standard",
    incoterms: "FOB",
    shippingLocation: "San Francisco, CA",
    freeShippingThreshold: 1000,
    expeditedAvailable: true,
    expeditedCost: 50,
    handlingFee: 25,
    packaging: "standard"
  },
  contractTerms: {
    minimumOrderValue: 500,
    volumeDiscounts: [
      { threshold: 10000, discount: 2.0, description: "2% discount for orders over $10,000" },
      { threshold: 25000, discount: 3.5, description: "3.5% discount for orders over $25,000" },
      { threshold: 50000, discount: 5.0, description: "5% discount for orders over $50,000" }
    ],
    returnPolicy: {
      returnWindow: 30,
      restockingFee: 15,
      conditions: "Items must be unopened and in original packaging"
    },
    warrantyPeriod: 12,
    specialTerms: "Bulk pricing available for annual contracts. Custom support packages included."
  },
  qualityTerms: {
    inspectionRequired: true,
    qualityStandards: "ISO 9001 certified",
    defectRate: 0.5,
    slaCompliance: 99.5,
    certifications: ["ISO 9001", "CE Marking", "RoHS Compliance"]
  }
};

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" }
];

const shippingMethods = [
  { value: "standard", label: "Standard Shipping" },
  { value: "expedited", label: "Expedited Shipping" },
  { value: "overnight", label: "Overnight Shipping" },
  { value: "freight", label: "Freight Shipping" }
];

const incotermOptions = [
  { value: "FOB", label: "FOB (Free on Board)" },
  { value: "CIF", label: "CIF (Cost, Insurance, Freight)" },
  { value: "EXW", label: "EXW (Ex Works)" },
  { value: "DDP", label: "DDP (Delivered Duty Paid)" },
  { value: "FCA", label: "FCA (Free Carrier)" }
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default async function ManageTermsPage({ params }: ManageTermsPageProps) {
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
            <p className="text-muted-foreground">You need to be part of an organization to manage supplier terms.</p>
          </div>
        </div>
      </div>
    );
  }

  const supplier = mockSupplierTerms;

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
                  Manage Terms & Conditions
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
                Save Terms
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Payment Terms */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white">Basic Terms</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentDays">Payment Terms (Days)</Label>
                    <Input
                      id="paymentDays"
                      type="number"
                      defaultValue={supplier.paymentTerms.standardTerms}
                      placeholder="30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue={supplier.paymentTerms.currency}>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditLimit">Credit Limit</Label>
                  <Input
                    id="creditLimit"
                    type="number"
                    defaultValue={supplier.paymentTerms.creditLimit}
                    placeholder="50000"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Current balance: {formatCurrency(supplier.paymentTerms.currentBalance)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="autoPayment" className="text-sm font-medium">
                    Auto Payment Enabled
                  </Label>
                  <Switch
                    id="autoPayment"
                    defaultChecked={supplier.paymentTerms.autoPayment}
                  />
                </div>
              </div>

              <Separator />

              {/* Early Payment Discount */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Early Payment Discount
                  </h4>
                  <Switch
                    defaultChecked={supplier.paymentTerms.earlyPaymentDiscount.enabled}
                  />
                </div>

                {supplier.paymentTerms.earlyPaymentDiscount.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="discountRate">Discount Rate (%)</Label>
                        <Input
                          id="discountRate"
                          type="number"
                          step="0.1"
                          defaultValue={supplier.paymentTerms.earlyPaymentDiscount.discountRate}
                          placeholder="2.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountDays">Days to Qualify</Label>
                        <Input
                          id="discountDays"
                          type="number"
                          defaultValue={supplier.paymentTerms.earlyPaymentDiscount.daysToQualify}
                          placeholder="10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discountDescription">Description</Label>
                      <Textarea
                        id="discountDescription"
                        defaultValue={supplier.paymentTerms.earlyPaymentDiscount.description}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>

              <Separator />

              {/* Late Payment Penalty */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Late Payment Penalty
                  </h4>
                  <Switch
                    defaultChecked={supplier.paymentTerms.latePaymentPenalty.enabled}
                  />
                </div>

                {supplier.paymentTerms.latePaymentPenalty.enabled && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="penaltyRate">Penalty Rate (%)</Label>
                        <Input
                          id="penaltyRate"
                          type="number"
                          step="0.1"
                          defaultValue={supplier.paymentTerms.latePaymentPenalty.penaltyRate}
                          placeholder="1.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gracePeriod">Grace Period (Days)</Label>
                        <Input
                          id="gracePeriod"
                          type="number"
                          defaultValue={supplier.paymentTerms.latePaymentPenalty.gracePeriod}
                          placeholder="5"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="penaltyDescription">Description</Label>
                      <Textarea
                        id="penaltyDescription"
                        defaultValue={supplier.paymentTerms.latePaymentPenalty.description}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Shipping Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shippingMethod">Default Method</Label>
                    <Select defaultValue={supplier.shippingTerms.defaultMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shipping method" />
                      </SelectTrigger>
                      <SelectContent>
                        {shippingMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incoterms">Incoterms</Label>
                    <Select defaultValue={supplier.shippingTerms.incoterms}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select incoterms" />
                      </SelectTrigger>
                      <SelectContent>
                        {incotermOptions.map((term) => (
                          <SelectItem key={term.value} value={term.value}>
                            {term.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingLocation">Shipping Location</Label>
                  <Input
                    id="shippingLocation"
                    defaultValue={supplier.shippingTerms.shippingLocation}
                    placeholder="Origin location"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeShipping">Free Shipping Threshold</Label>
                    <Input
                      id="freeShipping"
                      type="number"
                      defaultValue={supplier.shippingTerms.freeShippingThreshold}
                      placeholder="1000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="handlingFee">Handling Fee</Label>
                    <Input
                      id="handlingFee"
                      type="number"
                      defaultValue={supplier.shippingTerms.handlingFee}
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="expeditedAvailable" className="text-sm font-medium">
                    Expedited Shipping Available
                  </Label>
                  <Switch
                    id="expeditedAvailable"
                    defaultChecked={supplier.shippingTerms.expeditedAvailable}
                  />
                </div>

                {supplier.shippingTerms.expeditedAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="expeditedCost">Expedited Cost</Label>
                    <Input
                      id="expeditedCost"
                      type="number"
                      defaultValue={supplier.shippingTerms.expeditedCost}
                      placeholder="50"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contract Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Contract Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Minimum Order Value</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    defaultValue={supplier.contractTerms.minimumOrderValue}
                    placeholder="500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warrantyPeriod">Warranty Period (Months)</Label>
                    <Input
                      id="warrantyPeriod"
                      type="number"
                      defaultValue={supplier.contractTerms.warrantyPeriod}
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnWindow">Return Window (Days)</Label>
                    <Input
                      id="returnWindow"
                      type="number"
                      defaultValue={supplier.contractTerms.returnPolicy.returnWindow}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restockingFee">Restocking Fee (%)</Label>
                  <Input
                    id="restockingFee"
                    type="number"
                    step="0.1"
                    defaultValue={supplier.contractTerms.returnPolicy.restockingFee}
                    placeholder="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnConditions">Return Conditions</Label>
                  <Textarea
                    id="returnConditions"
                    defaultValue={supplier.contractTerms.returnPolicy.conditions}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialTerms">Special Terms</Label>
                  <Textarea
                    id="specialTerms"
                    defaultValue={supplier.contractTerms.specialTerms}
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume Discounts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Volume Discounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.contractTerms.volumeDiscounts.map((discount, index) => (
                <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-slate-900 dark:text-white">
                      Tier {index + 1}
                    </h5>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`threshold-${index}`}>Threshold Amount</Label>
                      <Input
                        id={`threshold-${index}`}
                        type="number"
                        defaultValue={discount.threshold}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`discount-${index}`}>Discount (%)</Label>
                      <Input
                        id={`discount-${index}`}
                        type="number"
                        step="0.1"
                        defaultValue={discount.discount}
                        placeholder="2.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      id={`description-${index}`}
                      defaultValue={discount.description}
                      placeholder="Discount description"
                    />
                  </div>
                </div>
              ))}

              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Add Discount Tier
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quality & Compliance Terms */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Quality & Compliance Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="inspectionRequired" className="text-sm font-medium">
                  Inspection Required
                </Label>
                <Switch
                  id="inspectionRequired"
                  defaultChecked={supplier.qualityTerms.inspectionRequired}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defectRate">Max Defect Rate (%)</Label>
                <Input
                  id="defectRate"
                  type="number"
                  step="0.1"
                  defaultValue={supplier.qualityTerms.defectRate}
                  placeholder="0.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slaCompliance">SLA Compliance (%)</Label>
                <Input
                  id="slaCompliance"
                  type="number"
                  step="0.1"
                  defaultValue={supplier.qualityTerms.slaCompliance}
                  placeholder="99.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityStandards">Quality Standards</Label>
                <Input
                  id="qualityStandards"
                  defaultValue={supplier.qualityTerms.qualityStandards}
                  placeholder="ISO 9001 certified"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex flex-wrap gap-2">
                {supplier.qualityTerms.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="gap-2">
                    <CheckCircle className="w-3 h-3" />
                    {cert}
                    <X className="w-3 h-3 cursor-pointer" />
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-2 mt-2">
                <Plus className="w-4 h-4" />
                Add Certification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
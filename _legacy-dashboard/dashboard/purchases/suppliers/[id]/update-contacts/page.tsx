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
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit,
  CreditCard,
  Truck,
  Settings,
  Star,
  UserCheck,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

interface UpdateContactsPageProps {
  params: {
    id: string;
  };
}

// Mock supplier contacts data
const mockSupplierContacts = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001",
  contacts: [
    {
      id: "contact_1",
      name: "John Smith",
      title: "Sales Manager",
      department: "Sales",
      email: "john.smith@techcorp.com",
      phone: "+1-555-123-4568",
      mobile: "+1-555-987-6541",
      extension: "101",
      isPrimary: true,
      isActive: true,
      contactType: "sales",
      preferredContact: true,
      lastContact: new Date("2024-11-20"),
      notes: "Primary point of contact for all sales inquiries and new orders.",
      address: {
        street: "123 Innovation Drive",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102"
      }
    },
    {
      id: "contact_2",
      name: "Sarah Johnson",
      title: "Accounts Manager",
      department: "Finance",
      email: "sarah.johnson@techcorp.com",
      phone: "+1-555-123-4569",
      mobile: "+1-555-987-6542",
      extension: "102",
      isPrimary: false,
      isActive: true,
      contactType: "finance",
      preferredContact: false,
      lastContact: new Date("2024-11-18"),
      notes: "Handles all billing and payment-related matters.",
      address: {
        street: "123 Innovation Drive",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102"
      }
    },
    {
      id: "contact_3",
      name: "Mike Rodriguez",
      title: "Technical Support Lead",
      department: "Support",
      email: "mike.rodriguez@techcorp.com",
      phone: "+1-555-123-4570",
      mobile: "+1-555-987-6543",
      extension: "103",
      isPrimary: false,
      isActive: true,
      contactType: "technical",
      preferredContact: true,
      lastContact: new Date("2024-11-15"),
      notes: "Technical support and product troubleshooting specialist.",
      address: {
        street: "456 Tech Park Avenue",
        city: "San Francisco",
        state: "CA",
        zipCode: "94103"
      }
    },
    {
      id: "contact_4",
      name: "Lisa Chen",
      title: "Logistics Coordinator",
      department: "Operations",
      email: "lisa.chen@techcorp.com",
      phone: "+1-555-123-4571",
      mobile: "+1-555-987-6544",
      extension: "104",
      isPrimary: false,
      isActive: false,
      contactType: "logistics",
      preferredContact: false,
      lastContact: new Date("2024-10-25"),
      notes: "Handles shipping, delivery scheduling, and logistics coordination. Currently on leave.",
      address: {
        street: "789 Warehouse District",
        city: "Oakland",
        state: "CA",
        zipCode: "94607"
      }
    }
  ]
};

const contactTypes = [
  { value: "sales", label: "Sales", icon: User },
  { value: "finance", label: "Finance", icon: CreditCard },
  { value: "technical", label: "Technical", icon: Settings },
  { value: "logistics", label: "Logistics", icon: Truck },
  { value: "management", label: "Management", icon: UserCheck },
  { value: "other", label: "Other", icon: User }
];

const departments = [
  { value: "sales", label: "Sales" },
  { value: "finance", label: "Finance" },
  { value: "support", label: "Support" },
  { value: "operations", label: "Operations" },
  { value: "management", label: "Management" },
  { value: "it", label: "Information Technology" }
];

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
};

const getContactTypeIcon = (type: string) => {
  const contactType = contactTypes.find(ct => ct.value === type);
  const IconComponent = contactType?.icon || User;
  return <IconComponent className="w-4 h-4" />;
};

const getContactTypeBadge = (type: string) => {
  const colors = {
    sales: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
    finance: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400",
    technical: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400",
    logistics: "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400",
    management: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400",
    other: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
  };

  return (
    <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.other}>
      {getContactTypeIcon(type)}
      {contactTypes.find(ct => ct.value === type)?.label || type}
    </Badge>
  );
};

export default async function UpdateContactsPage({ params }: UpdateContactsPageProps) {
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
            <p className="text-muted-foreground">You need to be part of an organization to update contacts.</p>
          </div>
        </div>
      </div>
    );
  }

  const supplier = mockSupplierContacts;

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
                  Update Contacts
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {supplier.name} ({supplier.code})
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Contact
              </Button>
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                Save All Changes
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Contacts</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{supplier.contacts.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Contacts</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {supplier.contacts.filter(c => c.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Primary Contacts</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {supplier.contacts.filter(c => c.isPrimary).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Contact Types</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {new Set(supplier.contacts.map(c => c.contactType)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {supplier.contacts.map((contact, index) => (
            <Card key={contact.id} className={`${!contact.isActive ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                        {contact.name}
                      </CardTitle>
                      {contact.isPrimary && (
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300">
                          <Star className="w-3 h-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                      {!contact.isActive && (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getContactTypeBadge(contact.contactType)}
                      <Badge variant="outline">
                        {contact.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {contact.title}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Contact Information Form */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Personal Information
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Full Name</Label>
                      <Input
                        id={`name-${index}`}
                        defaultValue={contact.name}
                        placeholder="Contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`title-${index}`}>Job Title</Label>
                      <Input
                        id={`title-${index}`}
                        defaultValue={contact.title}
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`department-${index}`}>Department</Label>
                      <Select defaultValue={contact.department}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.value} value={dept.value}>
                              {dept.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`contactType-${index}`}>Contact Type</Label>
                      <Select defaultValue={contact.contactType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Details
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor={`email-${index}`}>Email Address</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      defaultValue={contact.email}
                      placeholder="contact@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`phone-${index}`}>Office Phone</Label>
                      <Input
                        id={`phone-${index}`}
                        defaultValue={contact.phone}
                        placeholder="+1-555-123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`mobile-${index}`}>Mobile Phone</Label>
                      <Input
                        id={`mobile-${index}`}
                        defaultValue={contact.mobile}
                        placeholder="+1-555-987-6541"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`extension-${index}`}>Extension</Label>
                      <Input
                        id={`extension-${index}`}
                        defaultValue={contact.extension}
                        placeholder="101"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </h4>

                  <div className="space-y-2">
                    <Label htmlFor={`street-${index}`}>Street Address</Label>
                    <Input
                      id={`street-${index}`}
                      defaultValue={contact.address.street}
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`city-${index}`}>City</Label>
                      <Input
                        id={`city-${index}`}
                        defaultValue={contact.address.city}
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`state-${index}`}>State</Label>
                      <Input
                        id={`state-${index}`}
                        defaultValue={contact.address.state}
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`zip-${index}`}>ZIP Code</Label>
                      <Input
                        id={`zip-${index}`}
                        defaultValue={contact.address.zipCode}
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Settings and Notes */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Settings & Notes</h4>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`active-${index}`} className="text-sm font-medium">
                        Active Contact
                      </Label>
                      <Switch
                        id={`active-${index}`}
                        defaultChecked={contact.isActive}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`primary-${index}`} className="text-sm font-medium">
                        Primary Contact
                      </Label>
                      <Switch
                        id={`primary-${index}`}
                        defaultChecked={contact.isPrimary}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor={`preferred-${index}`} className="text-sm font-medium">
                        Preferred Contact
                      </Label>
                      <Switch
                        id={`preferred-${index}`}
                        defaultChecked={contact.preferredContact}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`notes-${index}`}>Notes</Label>
                    <Textarea
                      id={`notes-${index}`}
                      defaultValue={contact.notes}
                      rows={3}
                      placeholder="Contact notes and additional information"
                    />
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Last contact: {formatDate(contact.lastContact)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add New Contact Card */}
        <Card className="mt-6 border-2 border-dashed border-slate-200 dark:border-slate-700">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Add New Contact
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Create a new contact for this supplier
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Contact
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
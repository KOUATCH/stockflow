'use client';

import { updateLocation } from '@/actions/locations/locationActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/components/notifications/NotificationProvider';
import {
  Loader2,
  Save,
  MapPin,
  Building2,
  Phone,
  Mail,
  Settings,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';

interface LocationEditFormProps {
  location: any;
  organizationId: string;
}

interface FormData {
  name: string;
  code: string;
  type: string;
  address: string;
  phone: string;
  email: string;
  allowNegativeStock: boolean;
  requiresApproval: boolean;
  isDefault: boolean;
}

export default function BasicInfoTabFinal({ location, organizationId }: LocationEditFormProps) {
  const notifications = useNotifications();
  const [formData, setFormData] = useState<FormData>({
    name: location?.name || '',
    code: location?.code || '',
    type: location?.type || '',
    address: location?.address || '',
    phone: location?.phone || '',
    email: location?.email || '',
    allowNegativeStock: location?.allowNegativeStock || false,
    requiresApproval: location?.requiresApproval || false,
    isDefault: location?.isDefault || false,
  });

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        code: location.code || '',
        type: location.type || '',
        address: location.address || '',
        phone: location.phone || '',
        email: location.email || '',
        allowNegativeStock: location.allowNegativeStock || false,
        requiresApproval: location.requiresApproval || false,
        isDefault: location.isDefault || false,
      });
    }
  }, [location]);

  const handleInputChange = useCallback((field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleSelectChange = useCallback((field: keyof FormData) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleSwitchChange = useCallback((field: keyof FormData) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
    }));
  }, []);

  const handleSave = useCallback(async () => {
    if (!location?.id) {
      notifications.error(
        "Location Error",
        "Location ID not found"
      );
      return;
    }

    // Basic client-side validation
    if (!formData.name.trim()) {
      notifications.warning(
        "Validation Error",
        "Location name is required"
      );
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateLocation(location.id, formData);

        if (result.success) {
          notifications.formSuccess(
            "Location Update",
            `Location '${formData.name}' has been updated successfully`
          );

          // Refresh the window to show updated data
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error(result.error || 'Failed to update location');
        }
      } catch (error) {
        console.error('Save error:', error);
        notifications.formError(
          "Location Update",
          error instanceof Error ? error.message : "Failed to save changes",
          "Please check your internet connection and try again"
        );
      }
    });
  }, [formData, location?.id, notifications]);

  const hasChanges = useCallback(() => {
    if (!location) return false;

    return Object.keys(formData).some(key => {
      const formKey = key as keyof FormData;
      const formValue = formData[formKey];
      const locationValue = location[formKey];

      // For boolean fields, compare with the actual value or default to false
      if (typeof formValue === 'boolean') {
        return formValue !== (locationValue ?? false);
      }

      // For string fields, compare with the actual value or default to empty string
      return formValue !== (locationValue ?? '');
    });
  }, [formData, location]);

  if (!location) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading location data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Basic Information Card */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-slate-800/90 dark:to-slate-700/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Location Information</CardTitle>
                <CardDescription className="text-blue-100">
                  Update basic location details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Location Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  placeholder="Enter location name"
                  disabled={isPending}
                  required
                  className="h-12 bg-white/60 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Location Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location Code
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={handleInputChange('code')}
                  placeholder="Enter location code"
                  disabled={isPending}
                  className="h-12 bg-white/60 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Location Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={handleSelectChange('type')}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-12 bg-white/60 border-slate-200 focus:border-blue-500">
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warehouse">🏢 Warehouse</SelectItem>
                    <SelectItem value="store">🏪 Store</SelectItem>
                    <SelectItem value="outlet">🛍️ Outlet</SelectItem>
                    <SelectItem value="depot">🏭 Depot</SelectItem>
                    <SelectItem value="distribution_center">📦 Distribution Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="Enter phone number"
                  disabled={isPending}
                  className="h-12 bg-white/60 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="Enter email address"
                disabled={isPending}
                className="h-12 bg-white/60 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange('address')}
                placeholder="Enter location address"
                rows={3}
                disabled={isPending}
                className="bg-white/60 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-green-50/50 dark:from-slate-800/90 dark:to-slate-700/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-white">Location Settings</CardTitle>
                <CardDescription className="text-green-100">
                  Configure inventory and approval settings
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg border border-orange-200/50">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="allowNegativeStock" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Allow Negative Stock
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Allow items to have negative inventory levels at this location
                  </p>
                </div>
              </div>
              <Switch
                id="allowNegativeStock"
                checked={formData.allowNegativeStock}
                onCheckedChange={handleSwitchChange('allowNegativeStock')}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg border border-blue-200/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="requiresApproval" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Requires Approval
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Stock movements at this location require manager approval
                  </p>
                </div>
              </div>
              <Switch
                id="requiresApproval"
                checked={formData.requiresApproval}
                onCheckedChange={handleSwitchChange('requiresApproval')}
                disabled={isPending}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg border border-purple-200/50">
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-purple-600" />
                <div className="space-y-0.5">
                  <Label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Default Location
                  </Label>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Set this as the default location for new items
                  </p>
                </div>
              </div>
              <Switch
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={handleSwitchChange('isDefault')}
                disabled={isPending}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Section */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white/90 to-slate-50/50 dark:from-slate-800/90 dark:to-slate-700/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-4">
              {hasChanges() && !isPending && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-lg border border-amber-200/50">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isPending || !hasChanges()}
                className="h-12 px-8 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Location Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { notify } from "@/lib/notifications/notify"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  permissionCategories,
  rolePermissionMap,
  type RoleName,
  type PermissionCategory,
  getAllPermissions,
} from "@/config/permissions";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Crown,
  DollarSign,
  Download,
  Eye,
  Filter,
  HelpCircle,
  Key,
  Layers,
  Lock,
  Minus,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useState, useMemo, useCallback, useEffect } from "react";
interface RoleData {
  id?: string;
  name: string;
  description: string;
  color?: string;
  isSystemRole?: boolean;
  isActive: boolean;
  permissions: string[];
}

interface EnhancedRolePermissionsFormProps {
  initialData?: Partial<RoleData>;
  onSubmit: (data: RoleData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

const categoryIcons: Record<string, any> = {
  "Dashboard & Overview": BarChart3,
  "User Management": Users,
  "Profile Management": Eye,
  "Role Management": Shield,
  "Inventory Management": Package,
  "Location Management": Target,
  "Sales Management": ShoppingCart,
  "Purchase Management": Plus,
  "Financial Management": DollarSign,
  "Tax Management": Percent,
  "Customer Management": Users,
  "POS System": Settings,
  "Analytics & Reporting": TrendingUp,
  "System Administration": Settings,
  "Communication": Activity,
  "Data Management": Download,
};

const roleTemplates: Record<RoleName, { name: string; description: string; color: string }> = {
  admin: {
    name: "System Administrator",
    description: "Full system access with all permissions",
    color: "#dc2626",
  },
  manager: {
    name: "Store Manager",
    description: "Comprehensive management access",
    color: "#2563eb",
  },
  staff: {
    name: "Store Staff",
    description: "Operational access for daily tasks",
    color: "#059669",
  },
  cashier: {
    name: "Cashier",
    description: "POS and basic customer service access",
    color: "#7c3aed",
  },
  viewer: {
    name: "Viewer",
    description: "Read-only access to system data",
    color: "#6b7280",
  },
};

export default function EnhancedRolePermissionsForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create'
}: EnhancedRolePermissionsFormProps) {
  // Form state
  const [formData, setFormData] = useState<RoleData>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    color: initialData?.color || "#3b82f6",
    isSystemRole: initialData?.isSystemRole || false,
    isActive: initialData?.isActive !== false,
    permissions: initialData?.permissions || [],
  });

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [showOnlySelected, setShowOnlySelected] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPermissions = getAllPermissions().length;
    const selectedPermissions = formData.permissions.length;
    const selectionPercentage = Math.round((selectedPermissions / totalPermissions) * 100);

    const categoryStats = Object.entries(permissionCategories).map(([category, categoryPermissions]) => {
      const selectedInCategory = categoryPermissions.filter(p =>
        formData.permissions.includes(p)
      ).length;
      const totalInCategory = categoryPermissions.length;
      const percentage = Math.round((selectedInCategory / totalInCategory) * 100);

      return {
        category,
        selected: selectedInCategory,
        total: totalInCategory,
        percentage,
        isComplete: selectedInCategory === totalInCategory,
        isEmpty: selectedInCategory === 0,
      };
    });

    return {
      totalPermissions,
      selectedPermissions,
      selectionPercentage,
      categoryStats,
    };
  }, [formData.permissions]);

  // Filter and search permissions
  const filteredCategories = useMemo(() => {
    const categories = Object.entries(permissionCategories);

    return categories
      .map(([category, permissions]) => {
        let filteredPermissions = [...permissions];

        // Search filter
        if (searchTerm) {
          filteredPermissions = filteredPermissions.filter(permission =>
            permission.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Level filter
        if (filterLevel !== "all") {
          const selectedInCategory = permissions.filter(p =>
            formData.permissions.includes(p)
          ).length;
          const percentage = Math.round((selectedInCategory / permissions.length) * 100);

          if (filterLevel === "complete" && percentage !== 100) return null;
          if (filterLevel === "partial" && (percentage === 0 || percentage === 100)) return null;
          if (filterLevel === "empty" && percentage !== 0) return null;
        }

        // Show only selected filter
        if (showOnlySelected) {
          filteredPermissions = filteredPermissions.filter(permission =>
            formData.permissions.includes(permission)
          );
        }

        if (filteredPermissions.length === 0) return null;

        return [category, filteredPermissions] as [string, readonly string[]];
      })
      .filter(Boolean) as [string, readonly string[]][];
  }, [searchTerm, filterLevel, showOnlySelected, formData.permissions]);

  // Handle permission toggle
  const togglePermission = useCallback((permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  }, []);

  // Handle category toggle
  const toggleCategory = useCallback((category: string) => {
    const categoryPermissionValues = permissionCategories[category as PermissionCategory];
    if (!categoryPermissionValues) return;

    const categoryPermissions = [...categoryPermissionValues] as string[];
    const allSelected = categoryPermissions.every(p => formData.permissions.includes(p));

    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !categoryPermissions.includes(p))
        : [...new Set<string>([...prev.permissions, ...categoryPermissions])]
    }));
  }, [formData.permissions]);

  // Handle template selection
  const applyTemplate = useCallback((template: RoleName) => {
    const templatePermissions = rolePermissionMap[template];
    const templateInfo = roleTemplates[template];

    setFormData(prev => ({
      ...prev,
      name: prev.name || templateInfo.name,
      description: prev.description || templateInfo.description,
      color: templateInfo.color,
      permissions: [...templatePermissions]
    }));

    setSelectedTemplate(template);
    notify.success(`Applied ${templateInfo.name} template`);
  }, []);

  // Handle bulk operations
  const selectAll = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permissions: [...getAllPermissions()]
    }));
    notify.success("All permissions selected");
  }, []);

  const clearAll = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      permissions: []
    }));
    setSelectedTemplate("");
    notify.success("All permissions cleared");
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      notify.error("Role name is required");
      return;
    }

    if (formData.permissions.length === 0) {
      notify.error("At least one permission must be selected");
      return;
    }

    try {
      await onSubmit(formData);
      notify.success(`Role ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (error) {
      notify.error(`Failed to ${mode} role`);
    }
  };

  // Auto-expand categories with search results
  useEffect(() => {
    if (searchTerm) {
      const matchingCategories = filteredCategories.map(([category]) => category);
      setExpandedCategories(new Set(matchingCategories));
    }
  }, [searchTerm, filteredCategories]);

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto p-6 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 min-h-screen">

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {mode === 'create' ? 'Create Role' : 'Edit Role'} & Permissions
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Configure role permissions with granular control and intelligent templates
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Role Information */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    Role Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter role name..."
                    className="w-full"
                    disabled={formData.isSystemRole}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color" className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: formData.color }}
                    />
                    Role Color
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="color"
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-16 h-10 p-1 rounded cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this role can do..."
                  rows={3}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    disabled={formData.isSystemRole}
                  />
                  <Label htmlFor="active" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Active Role
                  </Label>
                </div>

                {formData.isSystemRole && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    System Role
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Permission Templates */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Role Templates
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Quick start with pre-configured permission sets
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(roleTemplates).map(([key, template]) => {
                  const isSelected = selectedTemplate === key;
                  const permissionCount = rolePermissionMap[key as RoleName].length;

                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        isSelected
                          ? 'ring-2 ring-purple-500 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => applyTemplate(key as RoleName)}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div
                          className="w-12 h-12 rounded-lg mx-auto flex items-center justify-center text-white shadow-md"
                          style={{ backgroundColor: template.color }}
                        >
                          <Shield className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{template.name}</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            {permissionCount} permissions
                          </p>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="bg-purple-600">
                            <Check className="w-3 h-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Permission Statistics */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Permission Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.selectedPermissions}
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Selected</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg">
                  <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                    {stats.totalPermissions}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Total</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.selectionPercentage}%
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">Coverage</div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.categoryStats.filter(c => c.isComplete).length}
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Complete Categories</div>
                </div>
              </div>

              {/* Progress bars for categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.categoryStats.map(({ category, selected, total, percentage, isComplete, isEmpty }) => (
                  <div key={category} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                          {category}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs">
                          {selected}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isComplete ? 'bg-green-500' :
                            isEmpty ? 'bg-slate-300' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permission Management */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Permission Management
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Search and Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="complete">Complete (100%)</SelectItem>
                    <SelectItem value="partial">Partial (1-99%)</SelectItem>
                    <SelectItem value="empty">Empty (0%)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-selected"
                    checked={showOnlySelected}
                    onCheckedChange={setShowOnlySelected}
                  />
                  <Label htmlFor="show-selected" className="text-sm">
                    Selected only
                  </Label>
                </div>
              </div>

              {/* Permissions List */}
              <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">
                      No permissions match your current filters
                    </p>
                  </div>
                ) : (
                  filteredCategories.map(([category, permissions]) => {
                    const CategoryIcon = categoryIcons[category] || Shield;
                    const isExpanded = expandedCategories.has(category);
                    const selectedCount = permissions.filter(p => formData.permissions.includes(p)).length;
                    const isComplete = selectedCount === permissions.length;
                    const isEmpty = selectedCount === 0;

                    return (
                      <Collapsible
                        key={category}
                        open={isExpanded}
                        onOpenChange={() => toggleCategoryExpansion(category)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className={`flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-700 ${
                            isComplete ? 'bg-green-50 dark:bg-green-900/20' :
                            isEmpty ? 'bg-slate-50 dark:bg-slate-800/30' :
                            'bg-blue-50 dark:bg-blue-900/20'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-slate-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-600" />
                                )}
                                <CategoryIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                              </div>
                              <div className="text-left">
                                <h3 className="font-medium text-slate-900 dark:text-white">
                                  {category}
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                  {selectedCount} of {permissions.length} selected
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {Math.round((selectedCount / permissions.length) * 100)}%
                                </div>
                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      isComplete ? 'bg-green-500' :
                                      isEmpty ? 'bg-slate-300' :
                                      'bg-blue-500'
                                    }`}
                                    style={{ width: `${(selectedCount / permissions.length) * 100}%` }}
                                  />
                                </div>
                              </div>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleCategory(category);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    {isComplete ? (
                                      <Minus className="w-4 h-4" />
                                    ) : (
                                      <Plus className="w-4 h-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isComplete ? 'Deselect all' : 'Select all'} permissions in {category}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="p-4 bg-white dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {permissions.map((permission) => {
                                const isSelected = formData.permissions.includes(permission);

                                return (
                                  <div
                                    key={permission}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700'
                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}
                                    onClick={() => togglePermission(permission)}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      onChange={() => togglePermission(permission)}
                                      className="shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {permission.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
                                      </div>
                                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                        {permission}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <AlertTriangle className="w-4 h-4" />
              {formData.permissions.length === 0 ? (
                "No permissions selected"
              ) : (
                `${formData.permissions.length} permissions selected`
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.name.trim() || formData.permissions.length === 0}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {mode === 'create' ? 'Create Role' : 'Update Role'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
}

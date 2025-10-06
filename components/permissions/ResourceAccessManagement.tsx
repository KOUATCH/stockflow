"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-unified';
import { usePermissions, useResourceAccess } from '@/lib/enterprise-permissions/hooks';
import { SYSTEM_PERMISSIONS } from '@/lib/enterprise-permissions/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import {
  Database,
  Shield,
  Lock,
  Unlock,
  Search,
  Settings,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Key,
  Crown,
  Globe,
  Building2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Layers,
  Award,
  Zap,
  Activity,
  Filter,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  Folder,
  HardDrive,
  Server,
  ExternalLink,
  Transfer,
  Share,
  UserPlus,
  UserMinus,
} from 'lucide-react';

interface Resource {
  id: string;
  type: 'organization' | 'user' | 'item' | 'order' | 'report' | 'location' | 'supplier' | 'customer';
  name: string;
  description?: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  isPublic: boolean;
  visibility: 'private' | 'organization' | 'public';
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
  permissions: ResourcePermission[];
  accessLogs: ResourceAccessLog[];
  tags?: string[];
  metadata?: any;
}

interface ResourcePermission {
  id: string;
  resourceId: string;
  userId?: string;
  roleId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  role?: {
    id: string;
    name: string;
    code: string;
  };
  permissionType: 'read' | 'write' | 'delete' | 'admin' | 'share';
  grantedAt: Date;
  grantedBy: string;
  expiresAt?: Date;
  isActive: boolean;
  conditions?: any;
}

interface ResourceAccessLog {
  id: string;
  resourceId: string;
  userId: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  timestamp: Date;
  ipAddress: string;
  status: 'success' | 'denied' | 'failed';
  duration?: number;
}

interface ResourceForm {
  type: string;
  name: string;
  description: string;
  visibility: string;
  isPublic: boolean;
  tags: string[];
  permissions: Array<{
    type: 'user' | 'role';
    id: string;
    permission: string;
    expiresAt?: Date;
  }>;
}

const RESOURCE_TYPES = [
  { value: 'organization', label: 'Organization', icon: Building2, color: 'from-blue-500 to-blue-600' },
  { value: 'user', label: 'User', icon: User, color: 'from-green-500 to-green-600' },
  { value: 'item', label: 'Item/Product', icon: Package, color: 'from-purple-500 to-purple-600' },
  { value: 'order', label: 'Order', icon: ShoppingCart, color: 'from-orange-500 to-orange-600' },
  { value: 'report', label: 'Report', icon: FileText, color: 'from-red-500 to-red-600' },
  { value: 'location', label: 'Location', icon: Globe, color: 'from-teal-500 to-teal-600' },
  { value: 'supplier', label: 'Supplier', icon: Truck, color: 'from-yellow-500 to-yellow-600' },
  { value: 'customer', label: 'Customer', icon: Users, color: 'from-pink-500 to-pink-600' },
];

const PERMISSION_TYPES = [
  { value: 'read', label: 'Read', icon: Eye, description: 'View resource data' },
  { value: 'write', label: 'Write', icon: Edit, description: 'Modify resource data' },
  { value: 'delete', label: 'Delete', icon: Trash2, description: 'Delete the resource' },
  { value: 'admin', label: 'Admin', icon: Crown, description: 'Full control including permissions' },
  { value: 'share', label: 'Share', icon: Share, description: 'Share resource with others' },
];

const ResourceAccessManagement = () => {
  const { session, hasPermission, user } = useAuth();
  const { hasPermission: hasEnterprisePermission, isLoading: permissionsLoading } = usePermissions();
  const { canAccess, isLoading: resourceLoading } = useResourceAccess();

  // State
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isAccessLogDialogOpen, setIsAccessLogDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Form state
  const [resourceForm, setResourceForm] = useState<ResourceForm>({
    type: 'item',
    name: '',
    description: '',
    visibility: 'organization',
    isPublic: false,
    tags: [],
    permissions: [],
  });

  // Mock data - in real implementation, this would come from your API
  useEffect(() => {
    const mockResources: Resource[] = [
      {
        id: '1',
        type: 'report',
        name: 'Q1 Financial Report',
        description: 'Quarterly financial analysis and performance metrics',
        ownerId: 'user1',
        owner: {
          id: 'user1',
          name: 'John Smith',
          email: 'john.smith@company.com',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
        isPublic: false,
        visibility: 'organization',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-01'),
        organizationId: user?.organizationId || '',
        tags: ['financial', 'quarterly', 'report'],
        permissions: [
          {
            id: '1',
            resourceId: '1',
            userId: 'user2',
            user: {
              id: 'user2',
              name: 'Sarah Johnson',
              email: 'sarah.johnson@company.com',
            },
            permissionType: 'read',
            grantedAt: new Date('2024-01-16'),
            grantedBy: 'user1',
            isActive: true,
          },
          {
            id: '2',
            resourceId: '1',
            roleId: 'manager',
            role: {
              id: 'manager',
              name: 'Manager',
              code: 'manager',
            },
            permissionType: 'write',
            grantedAt: new Date('2024-01-15'),
            grantedBy: 'user1',
            isActive: true,
          },
        ],
        accessLogs: [
          {
            id: '1',
            resourceId: '1',
            userId: 'user2',
            user: {
              name: 'Sarah Johnson',
              email: 'sarah.johnson@company.com',
            },
            action: 'VIEW_REPORT',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            ipAddress: '192.168.1.105',
            status: 'success',
            duration: 1250,
          },
        ],
      },
      {
        id: '2',
        type: 'item',
        name: 'Premium Coffee Beans',
        description: 'High-quality arabica coffee beans from Colombia',
        ownerId: 'user3',
        owner: {
          id: 'user3',
          name: 'Mike Davis',
          email: 'mike.davis@company.com',
        },
        isPublic: true,
        visibility: 'public',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-10'),
        organizationId: user?.organizationId || '',
        tags: ['coffee', 'premium', 'inventory'],
        permissions: [
          {
            id: '3',
            resourceId: '2',
            roleId: 'cashier',
            role: {
              id: 'cashier',
              name: 'Cashier',
              code: 'cashier',
            },
            permissionType: 'read',
            grantedAt: new Date('2024-01-20'),
            grantedBy: 'user3',
            isActive: true,
          },
        ],
        accessLogs: [],
      },
      {
        id: '3',
        type: 'customer',
        name: 'ABC Corporation',
        description: 'Enterprise customer - bulk orders',
        ownerId: 'user1',
        owner: {
          id: 'user1',
          name: 'John Smith',
          email: 'john.smith@company.com',
        },
        isPublic: false,
        visibility: 'private',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-15'),
        organizationId: user?.organizationId || '',
        tags: ['customer', 'enterprise', 'bulk'],
        permissions: [
          {
            id: '4',
            resourceId: '3',
            userId: 'user4',
            user: {
              id: 'user4',
              name: 'Alice Johnson',
              email: 'alice.johnson@company.com',
            },
            permissionType: 'admin',
            grantedAt: new Date('2024-02-01'),
            grantedBy: 'user1',
            isActive: true,
            expiresAt: new Date('2024-05-01'),
          },
        ],
        accessLogs: [],
      },
    ];

    setResources(mockResources);
  }, [user?.organizationId]);

  // Filter resources based on search and filters
  useEffect(() => {
    let filtered = resources;

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (selectedVisibility !== 'all') {
      filtered = filtered.filter(resource => resource.visibility === selectedVisibility);
    }

    setFilteredResources(filtered);
  }, [resources, searchTerm, selectedType, selectedVisibility]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateResource = () => {
    setResourceForm({
      type: 'item',
      name: '',
      description: '',
      visibility: 'organization',
      isPublic: false,
      tags: [],
      permissions: [],
    });
    setIsResourceDialogOpen(true);
  };

  const handleManagePermissions = (resource: Resource) => {
    setSelectedResource(resource);
    setIsPermissionDialogOpen(true);
  };

  const handleViewAccessLogs = (resource: Resource) => {
    setSelectedResource(resource);
    setIsAccessLogDialogOpen(true);
  };

  const getResourceTypeInfo = (type: string) => {
    return RESOURCE_TYPES.find(t => t.value === type) || RESOURCE_TYPES[0];
  };

  const getVisibilityColor = (visibility: string) => {
    const colors = {
      private: 'text-red-600 bg-red-50 border-red-200',
      organization: 'text-blue-600 bg-blue-50 border-blue-200',
      public: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[visibility as keyof typeof colors] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getPermissionIcon = (permissionType: string) => {
    const permission = PERMISSION_TYPES.find(p => p.value === permissionType);
    return permission?.icon || Key;
  };

  if (permissionsLoading || resourceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Database className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Resource Access...</h2>
          <p className="text-gray-600">Please wait while we load resource data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg">
              <Database className="h-8 w-8" />
            </div>
            Resource Access Management
          </h1>
          <p className="text-muted-foreground text-lg mt-1">Control access to organizational resources and data</p>
          <div className="flex items-center gap-4 mt-3">
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1">
              <HardDrive className="h-4 w-4" />
              {resources.length} Total Resources
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {resources.filter(r => r.isPublic).length} Public
            </Badge>
            <Badge variant="outline" className="px-3 py-1 font-medium">
              <Shield className="h-4 w-4 mr-2" />
              {resources.reduce((acc, r) => acc + r.permissions.length, 0)} Access Grants
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleCreateResource}
            className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Resource
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm shadow-lg">
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="access-logs" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Access Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          {/* Filters */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Filter className="h-5 w-5 text-teal-600" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Resources</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name, description, owner, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 shadow-sm focus:shadow-md transition-all"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <Label htmlFor="type-filter">Resource Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {RESOURCE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-48">
                  <Label htmlFor="visibility-filter">Visibility</Label>
                  <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                    <SelectTrigger className="mt-2 bg-white/80 backdrop-blur-sm">
                      <SelectValue placeholder="All visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Visibility</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="organization">Organization</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const typeInfo = getResourceTypeInfo(resource.type);
              const IconComponent = typeInfo.icon;

              return (
                <Card key={resource.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <CardHeader className={`bg-gradient-to-r ${typeInfo.color} border-b text-white`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{resource.name}</CardTitle>
                          <p className="text-white/80 text-sm">{typeInfo.label}</p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${getVisibilityColor(resource.visibility)} bg-white/20 text-white border-white/30`}
                      >
                        {resource.visibility}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {resource.description && (
                        <div>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={resource.owner.image} alt={resource.owner.name} />
                          <AvatarFallback className="text-xs">
                            {resource.owner.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{resource.owner.name}</p>
                          <p className="text-xs text-muted-foreground">Owner</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Permissions:</span>
                        <Badge variant="outline">
                          {resource.permissions.filter(p => p.isActive).length}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Access Logs:</span>
                        <Badge variant="secondary">
                          {resource.accessLogs.length}
                        </Badge>
                      </div>

                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {resource.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{resource.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleManagePermissions(resource)}
                        >
                          <Key className="h-4 w-4 mr-2" />
                          Permissions
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewAccessLogs(resource)}
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Key className="h-5 w-5 text-purple-600" />
                Resource Permission Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Key className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Permission Matrix</h3>
                <p className="text-gray-600">View and manage resource permissions across users and roles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access-logs" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Activity className="h-5 w-5 text-indigo-600" />
                Resource Access Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {resources.flatMap(resource =>
                  resource.accessLogs.map(log => (
                    <div key={log.id} className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl ${log.status === 'success' ? 'bg-green-50 text-green-600' : log.status === 'denied' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{log.user.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.action}
                              </Badge>
                              <Badge variant={log.status === 'success' ? 'secondary' : 'destructive'} className="text-xs">
                                {log.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Accessed {resource.name} • {log.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{log.ipAddress}</p>
                          {log.duration && <p>{log.duration}ms</p>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Database className="h-6 w-6 text-teal-600" />
              Create New Resource
            </DialogTitle>
            <DialogDescription>
              Define a new resource and configure its access permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resource-type">Resource Type *</Label>
                <Select
                  value={resourceForm.type}
                  onValueChange={(value) => setResourceForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOURCE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resource-name">Resource Name *</Label>
                <Input
                  id="resource-name"
                  value={resourceForm.name}
                  onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter resource name"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                value={resourceForm.description}
                onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this resource..."
                className="bg-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="resource-visibility">Visibility *</Label>
                <Select
                  value={resourceForm.visibility}
                  onValueChange={(value) => setResourceForm(prev => ({ ...prev, visibility: value }))}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="is-public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Public Access
                </Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-public"
                    checked={resourceForm.isPublic}
                    onCheckedChange={(checked) => setResourceForm(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="is-public" className="text-sm">
                    Allow public access to this resource
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Initial Permissions</h3>
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <UserPlus className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Add users and roles with specific permissions</p>
                <Button variant="outline" size="sm" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Permission
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsResourceDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Create Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Permissions Dialog */}
      <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Key className="h-6 w-6 text-purple-600" />
              Manage Permissions: {selectedResource?.name}
            </DialogTitle>
            <DialogDescription>
              Control who can access this resource and what they can do.
            </DialogDescription>
          </DialogHeader>

          {selectedResource && (
            <div className="space-y-6">
              {/* Current Permissions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Current Permissions</h3>
                <div className="space-y-3">
                  {selectedResource.permissions.filter(p => p.isActive).map((permission) => {
                    const PermissionIcon = getPermissionIcon(permission.permissionType);
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <PermissionIcon className="h-5 w-5" />
                          </div>
                          <div>
                            {permission.user ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={permission.user.image} alt={permission.user.name} />
                                  <AvatarFallback className="text-xs">
                                    {permission.user.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{permission.user.name}</span>
                                <Badge variant="outline" className="text-xs">User</Badge>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-amber-600" />
                                <span className="font-medium">{permission.role?.name}</span>
                                <Badge variant="secondary" className="text-xs">Role</Badge>
                              </div>
                            )}
                            <div className="text-sm text-muted-foreground">
                              <span className="capitalize">{permission.permissionType}</span> access
                              {permission.expiresAt && (
                                <span> • Expires {permission.expiresAt.toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add New Permission */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Add New Permission</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>User/Role</Label>
                    <Select>
                      <SelectTrigger className="mt-2 bg-white">
                        <SelectValue placeholder="Select user or role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user1">John Smith (User)</SelectItem>
                        <SelectItem value="user2">Sarah Johnson (User)</SelectItem>
                        <SelectItem value="role1">Manager (Role)</SelectItem>
                        <SelectItem value="role2">Cashier (Role)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Permission Type</Label>
                    <Select>
                      <SelectTrigger className="mt-2 bg-white">
                        <SelectValue placeholder="Select permission" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERMISSION_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} - {type.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Permission
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPermissionDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Access Logs Dialog */}
      <Dialog open={isAccessLogDialogOpen} onOpenChange={setIsAccessLogDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3">
              <Activity className="h-6 w-6 text-indigo-600" />
              Access Logs: {selectedResource?.name}
            </DialogTitle>
            <DialogDescription>
              View detailed access logs for this resource.
            </DialogDescription>
          </DialogHeader>

          {selectedResource && (
            <div className="space-y-4">
              {selectedResource.accessLogs.length > 0 ? (
                selectedResource.accessLogs.map((log) => (
                  <div key={log.id} className="p-4 rounded-xl border border-gray-200 bg-white/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-xl ${log.status === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{log.user.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {log.action}
                            </Badge>
                            <Badge
                              variant={log.status === 'success' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {log.timestamp.toLocaleString()} • {log.ipAddress}
                            {log.duration && ` • ${log.duration}ms`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No access logs available for this resource</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setIsAccessLogDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceAccessManagement;
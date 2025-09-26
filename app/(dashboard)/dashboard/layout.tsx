"use client";

import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Bell,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Cpu,
  Diamond,
  DollarSign,
  FileText,
  Hexagon,
  Layers,
  MapPin,
  Menu,
  Orbit,
  Package,
  Package2,
  Plus,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Target,
  TrendingUp,
  Truck,
  Users,
  Users2,
  X,
  XCircle
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';

// Mock session data for demo
const mockSession = {
  user: {
    name: "Sarah Johnson",
    email: "sarah.johnson@inventorytech.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b577?w=150&h=150&fit=crop&crop=face",
    organizationName: "InventoryTech Solutions",
    organizationId: "ITS-2024-ENTERPRISE",
    roles: [{ name: "Inventory Manager" }],
    permissions: [
      "dashboard.read", "users.read", "roles.read", "inventory.read", "items.read",
      "categories.read", "brands.read", "units.read", "stock.read", "sales.read",
      "purchase.orders.read", "settings.read", "blogs.read", "orders.read", "reports.read",
      "transfers.read", "adjustments.read", "suppliers.read", "locations.read",
      "customers.read", "customers.create", "pos.read", "cash.read", "session.read",
      "movements.read", "purchase.orders.create"
    ]
  }
};

// Modern unified navigation configuration
const navigationConfig = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Cpu,
    permission: "dashboard.read",
    gradient: "from-blue-500 via-indigo-500 to-purple-600",
    glowColor: "shadow-blue-500/25",
    badge: "Live",
    description: "Real-time business overview"
  },
  {
    title: "Point of Sale",
    href: "/dashboard/pos",
    icon: ShoppingBag,
    permission: "pos.read",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "shadow-emerald-500/25",
    badge: "POS",
    description: "Sales terminal and transactions"
  },
  {
    title: "Cash Drawer",
    href: "/dashboard/cashDrawer",
    icon: DollarSign,
    permission: "cash.read",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/25",
    badge: "Cash",
    description: "Cash management and reconciliation"
  },
  {
    title: "Inventory Management",
    icon: Package2,
    permission: "inventory.read",
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    glowColor: "shadow-violet-500/25",
    badge: "Core",
    description: "Product and stock management",
    children: [
      { title: "All Items", href: "/dashboard/inventory/items", permission: "items.read", icon: Package },
      { title: "Categories", href: "/dashboard/inventory/categories", permission: "categories.read", icon: Layers },
      { title: "Brands", href: "/dashboard/inventory/brands", permission: "brands.read", icon: Award },
      { title: "Units", href: "/dashboard/inventory/units", permission: "units.read", icon: Target },
      { title: "Stock Movements", href: "/dashboard/inventory/movements", permission: "movements.read", icon: Activity },
      { title: "Locations", href: "/dashboard/inventory/locations", permission: "locations.read", icon: MapPin }
    ]
  },
  {
    title: "Stock Management",
    icon: Hexagon,
    permission: "stock.read",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/25",
    badge: "Hot",
    description: "Monitor stock levels",
    children: [
      { title: "Current Stock", href: "/dashboard/stock/current", permission: "stock.read", icon: Package2 },
      { title: "Low Stock Alert", href: "/dashboard/stock/low-stock", permission: "stock.read", icon: AlertTriangle },
      { title: "Stock Movements", href: "/dashboard/stock/movements", permission: "stock.read", icon: Activity },
      { title: "Reorder Points", href: "/dashboard/stock/reorder", permission: "stock.read", icon: Bell }
    ]
  },
  {
    title: "Transfers & Adjustments",
    icon: Orbit,
    permission: "transfers.read",
    gradient: "from-violet-500 via-purple-500 to-pink-500",
    glowColor: "shadow-violet-500/25",
    badge: "Pro",
    description: "Move and adjust inventory",
    children: [
      { title: "Stock Transfers", href: "/dashboard/transfers", permission: "transfers.read", icon: Truck },
      { title: "Create Transfer", href: "/dashboard/transfers/create", permission: "transfers.create", icon: Plus },
      { title: "Stock Adjustments", href: "/dashboard/adjustments", permission: "adjustments.read", icon: Settings },
      { title: "Create Adjustment", href: "/dashboard/adjustments/create", permission: "adjustments.create", icon: Plus }
    ]
  },
  {
    title: "Purchase Orders",
    icon: Truck,
    permission: "purchase.orders.read",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glowColor: "shadow-sky-500/25",
    badge: "Proc",
    description: "Procurement and purchasing",
    children: [
      { title: "All Orders", href: "/dashboard/purchase-orders", permission: "purchase.orders.read", icon: FileText },
      { title: "Create Order", href: "/dashboard/purchase-orders/new", permission: "purchase.orders.create", icon: Plus },
      { title: "Order Workflow", href: "/dashboard/purchaseOrderWorkflow", permission: "purchase.orders.read", icon: Activity },
      { title: "Pending Approvals", href: "/dashboard/purchase-orders/pending", permission: "purchase.orders.read", icon: Clock },
      { title: "Received Orders", href: "/dashboard/purchase-orders/received", permission: "purchase.orders.read", icon: CheckCircle }
    ]
  },
  {
    title: "Suppliers",
    icon: Users2,
    permission: "suppliers.read",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    glowColor: "shadow-green-500/25",
    badge: "Elite",
    description: "Vendor management",
    children: [
      { title: "All Suppliers", href: "/dashboard/suppliers", permission: "suppliers.read", icon: Building2 },
      { title: "Supplier Items", href: "/dashboard/suppliers/items", permission: "suppliers.read", icon: Package },
      { title: "Performance", href: "/dashboard/suppliers/performance", permission: "suppliers.read", icon: BarChart3 }
    ]
  },
  {
    title: "Customer Management",
    icon: Users,
    permission: "customers.read",
    gradient: "from-rose-500 via-pink-500 to-red-500",
    glowColor: "shadow-rose-500/25",
    badge: "CRM",
    description: "Customer relationship management",
    children: [
      { title: "All Customers", href: "/dashboard/customers", permission: "customers.read", icon: Users },
      { title: "Add Customer", href: "/dashboard/customers/new", permission: "customers.create", icon: Plus },
      { title: "Customer Analytics", href: "/dashboard/customers/analytics", permission: "customers.read", icon: BarChart3 },
      { title: "Customer Support", href: "/dashboard/customers/support", permission: "customers.read", icon: Shield }
    ]
  },
  {
    title: "Session & Sync",
    href: "/dashboard/session-pos-sync",
    icon: Activity,
    permission: "session.read",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    glowColor: "shadow-green-500/25",
    badge: "Sync",
    description: "POS session synchronization"
  },
  {
    title: "Sales & Orders",
    icon: Diamond,
    permission: "sales.read",
    gradient: "from-pink-500 via-rose-500 to-red-500",
    glowColor: "shadow-pink-500/25",
    badge: "$$",
    description: "Sales operations",
    children: [
      { title: "Sales Orders", href: "/dashboard/sales/orders", permission: "sales.read", icon: FileText },
      { title: "Point of Sale", href: "/dashboard/pos", permission: "pos.read", icon: ShoppingBag },
      { title: "Returns", href: "/dashboard/returns", permission: "returns.read", icon: XCircle }
    ]
  },
  {
    title: "Analytics & Reports",
    icon: Activity,
    permission: "reports.read",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    glowColor: "shadow-indigo-500/25",
    badge: "AI",
    description: "Data insights",
    children: [
      { title: "Inventory Reports", href: "/dashboard/reports/inventory", permission: "reports.read", icon: BarChart3 },
      { title: "Stock Analysis", href: "/dashboard/reports/stock", permission: "reports.read", icon: TrendingUp },
      { title: "Supplier Reports", href: "/dashboard/reports/suppliers", permission: "reports.read", icon: Users2 }
    ]
  },
  {
    title: "System Settings",
    icon: Settings,
    permission: "settings.read",
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    glowColor: "shadow-slate-500/25",
    badge: "Admin",
    description: "Configuration",
    children: [
      { title: "General Settings", href: "/dashboard/settings/general", permission: "settings.read", icon: Settings },
      { title: "User Management", href: "/dashboard/settings/users", permission: "users.read", icon: Users },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles", permission: "roles.read", icon: Shield },
      { title: "Company Profile", href: "/dashboard/settings/company", permission: "company.read", icon: Building2 }
    ]
  }
];

// Mock inventory data
const mockInventoryStats = {
  totalItems: 2847,
  lowStock: 23,
  outOfStock: 7,
  totalValue: 847293,
  pendingOrders: 15,
  recentTransfers: 8
};

const mockRecentItems = [
  { id: 1, name: "Industrial Bearings", sku: "IB-2024-001", stock: 145, category: "Mechanical", status: "In Stock" },
  { id: 2, name: "Steel Pipes 6inch", sku: "SP-6-2024", stock: 8, category: "Plumbing", status: "Low Stock" },
  { id: 3, name: "Electric Motors 5HP", sku: "EM-5HP-001", stock: 0, category: "Electrical", status: "Out of Stock" },
  { id: 4, name: "Safety Helmets", sku: "SH-PPE-024", stock: 89, category: "Safety", status: "In Stock" }
];

const InventoryLayout = ({ children }: { children: ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Inventory Control', 'Stock Management']));
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const hasPermission = (permission: string) => {
    return mockSession.user.permissions.includes(permission);
  };

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
  };

  const filteredNavigation = navigationConfig.filter(item => {
    if (!hasPermission(item.permission)) return false;
    if (item.children) {
      return item.children.some(child => hasPermission(child.permission));
    }
    return true;
  });

  type NavItemType = {
    title: string;
    href?: string;
    icon?: React.ElementType;
    permission: string;
    gradient?: string;
    glowColor?: string;
    badge?: string;
    description?: string;
    children?: NavItemType[];
  };

  const NavItem = ({ item, isChild = false }: { item: NavItemType; isChild?: boolean }) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.has(item.title);
    const isActive = currentPath === item.href ||
      (item.children && item.children.some((child: NavItemType) => child.href === currentPath));
    const isHovered = hoveredItem === item.title;

    return (
      <div className="group relative">
        <button
          onClick={() => {
            if (item.href) {
              setCurrentPath(item.href);
              setIsMobileOpen(false);
            } else if (item.children) {
              toggleExpanded(item.title);
            }
          }}
          onMouseEnter={() => setHoveredItem(item.title)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden
            ${isActive && !isChild
              ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl ${item.glowColor} transform scale-[1.02]`
              : isActive && isChild
                ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50 shadow-md'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-lg hover:border hover:border-gray-200/50'
            }
            ${isChild ? 'ml-8 py-2.5' : ''}
            ${isCollapsed && !isChild ? 'justify-center' : ''}
          `}
        >
          {(isActive || isHovered) && !isChild && (
            <div className={`
              absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 rounded-2xl
              transition-opacity duration-300
            `} />
          )}

          {Icon && (
            <div className={`
              flex-shrink-0 transition-all duration-300 relative z-10
              ${isActive ? 'scale-110 drop-shadow-lg' : isHovered ? 'scale-105' : ''}
              ${isCollapsed && !isChild ? 'scale-125' : ''}
            `}>
              <div className={`
                relative p-2 rounded-xl transition-all duration-300
                ${isActive && !isChild
                  ? 'bg-white/20 backdrop-blur-sm'
                  : isHovered && !isChild
                    ? `bg-gradient-to-r ${item.gradient} bg-opacity-10`
                    : ''
                }
              `}>
                <Icon size={isChild ? 18 : 22} />
                {isActive && !isChild && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm animate-pulse" />
                )}
              </div>
            </div>
          )}

          <div className={`
            flex-1 transition-all duration-300 relative z-10 min-w-0
            ${isCollapsed && !isChild ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className={`
                  font-semibold transition-all duration-200 block truncate
                  ${isChild ? 'text-sm' : 'text-base'}
                `}>
                  {item.title}
                </span>
                {!isChild && !isCollapsed && item.description && (
                  <span className={`
                    text-xs opacity-75 block truncate transition-all duration-200
                    ${isActive ? 'text-white/80' : 'text-gray-500'}
                  `}>
                    {item.description}
                  </span>
                )}
              </div>

              {item.badge && !isChild && !isCollapsed && (
                <span className={`
                  px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200
                  ${isActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                  }
                `}>
                  {item.badge}
                </span>
              )}

              {item.children && !isCollapsed && (
                <div className={`
                  ml-2 transition-all duration-300 relative z-10
                  ${isExpanded ? 'rotate-180' : 'rotate-0'}
                `}>
                  <ChevronDown size={16} />
                </div>
              )}
            </div>
          </div>

          {isCollapsed && !isChild && isHovered && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50">
              <div className="font-medium">{item.title}</div>
              {item.description && (
                <div className="text-xs opacity-75">{item.description}</div>
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </button>

        {item.children && !isCollapsed && (
          <div className={`
            overflow-hidden transition-all duration-500 ease-out
            ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
          `}>
            <div className="space-y-1">
              {item.children
                .filter((child: { permission: string }) => hasPermission(child.permission))
                .map((child: any, index: number) => (
                  <div
                    key={child.title}
                    className={`
                      transition-all duration-300
                      ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                    `}
                    style={{ transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' }}
                  >
                    <NavItem item={child} isChild />
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <NotificationProvider maxNotifications={5} defaultSoundEnabled={true}>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Desktop Sidebar */}
      <div className={`
        hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-500
        ${isCollapsed ? 'w-24' : 'w-80'}
      `}>
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="relative">
              <div className={`
                w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl 
                flex items-center justify-center shadow-xl shadow-emerald-500/25 transition-all duration-300
                ${isCollapsed ? 'scale-110' : 'scale-100'}
              `}>
                <Package2 className="w-7 h-7 text-white drop-shadow-sm" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl opacity-20 blur animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  STOCKFLOW
                </h1>
                <p className="text-sm text-gray-500 font-medium">Inventory System</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white shadow-lg border border-gray-200/50
              hover:shadow-xl hover:scale-105 transition-all duration-200
              ${isCollapsed ? '-right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0' : ''}
            `}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Organization Info */}
        {!isCollapsed && (
          <div className="px-6 py-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-b border-gray-100/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl opacity-20 blur animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate text-lg">{mockSession.user.organizationName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Package className="w-3 h-3 mr-1" />
                    {mockSession.user.roles[0].name}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className={`
            text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-300
            ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto mb-4'}
          `}>
            Inventory Management
          </div>
          {filteredNavigation.map((item, index) => (
            <div
              key={item.title}
              className="animate-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <NavItem item={item} />
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className={`
            flex items-center gap-3 p-4 rounded-2xl bg-white shadow-lg border border-gray-200/50
            hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div className="relative">
              <img
                src={mockSession.user.image}
                alt={mockSession.user.name}
                className="w-10 h-10 rounded-2xl object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{mockSession.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{mockSession.user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl z-50 shadow-2xl
        transform transition-all duration-500 md:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Package2 className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-black text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              STOCKFLOW
            </h1>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item, index) => (
            <div
              key={item.title}
              className="animate-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
            >
              <NavItem item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb Navigation */}
              <nav className="hidden sm:flex items-center space-x-2 text-sm">
                <a href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">Dashboard</a>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">Customers</span>
              </nav>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-12 pr-6 py-3 w-80 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="hidden lg:flex items-center gap-2">
                <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200">
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <img
                  src={mockSession.user.image}
                  alt={mockSession.user.name}
                  className="w-8 h-8 rounded-xl object-cover"
                />
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{mockSession.user.name}</p>
                  <p className="text-xs text-gray-500">{mockSession.user.roles[0].name}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          {children}
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
};

export default InventoryLayout;

"use client";

import UserDropdownMenu from '@/components/UserDropdownMenu';
import { useAuth } from '@/lib/auth-unified';
import { PERMISSIONS } from '@/lib/permissions';
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Crown,
  Diamond,
  DollarSign,
  Globe,
  Hexagon,
  Layers,
  Menu,
  Orbit,
  Package,
  Package2,
  Search,
  Settings,
  Shield,
  ShoppingBag,
  Star,
  Target,
  TrendingUp,
  Users,
  Users2,
  X,
  Zap
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RouteDebugger } from '@/components/debug/RouteDebugger';

// Enhanced navigation configuration with RBAC integration
const navigationConfig = [
  {
    title: "Command Center",
    href: "/dashboard",
    icon: Cpu,
    permission: PERMISSIONS.VIEW_ORGANIZATION_SETTINGS,
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-500/25",
    badge: "New",
    description: "Central hub for all operations"
  },
  {
    title: "Team Universe",
    icon: Users2,
    permission: PERMISSIONS.READ_USERS,
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    glowColor: "shadow-rose-500/25",
    badge: "Hot",
    description: "Manage your dream team",
    children: [
      { title: "Admin Panel", href: "/dashboard/admin", permission: PERMISSIONS.MANAGE_ORGANIZATION, icon: Shield },
      { title: "User Management", href: "/dashboard/settings/users", permission: PERMISSIONS.READ_USERS, icon: Users },
      { title: "Role Management", href: "/dashboard/settings/roles", permission: PERMISSIONS.READ_ROLES, icon: Crown },
      { title: "Change Password", href: "/dashboard/change-password", permission: PERMISSIONS.READ_USERS, icon: Star }
    ]
  },
  {
    title: "Inventory Galaxy",
    icon: Hexagon,
    permission: PERMISSIONS.READ_ITEMS,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "shadow-emerald-500/25",
    badge: "Pro",
    description: "Your digital warehouse",
    children: [
      { title: "Product Arsenal", href: "/dashboard/inventory/items", permission: PERMISSIONS.READ_ITEMS, icon: Package2 },
      { title: "Category Matrix", href: "/dashboard/inventory/categories", permission: PERMISSIONS.READ_ITEMS, icon: Layers },
      { title: "Brand Empire", href: "/dashboard/inventory/brands", permission: PERMISSIONS.READ_ITEMS, icon: Award },
      { title: "Inventory Overview", href: "/dashboard/inventory", permission: PERMISSIONS.READ_ITEMS, icon: Target },
      { title: "Stock Movements", href: "/dashboard/inventory/movements", permission: PERMISSIONS.READ_ITEMS, icon: Bell },
      { title: "Stock Transfers", href: "/dashboard/inventory/transfers", permission: PERMISSIONS.MANAGE_INVENTORY_LEVELS, icon: Orbit }
    ]
  },
  {
    title: "Revenue Engine",
    icon: Diamond,
    permission: PERMISSIONS.VIEW_SALES_REPORTS,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/25",
    badge: "$$",
    description: "Money-making machine",
    children: [
      { title: "Sales Dashboard", href: "/dashboard/sales", permission: PERMISSIONS.VIEW_SALES_REPORTS, icon: TrendingUp },
      // { title: "Sales Orders", href: "/dashboard/app/sales/orders", permission: PERMISSIONS.VIEW_SALES_REPORTS, icon: FileText },
      { title: "POS Terminal", href: "/dashboard/app/sales/pos", permission: PERMISSIONS.OPERATE_POS, icon: Zap },
      { title: "Advanced POS", href: "/dashboard/session-pos-sync", permission: PERMISSIONS.OPERATE_POS, icon: Diamond },
      { title: "Customer Base", href: "/dashboard/customers", permission: PERMISSIONS.READ_CUSTOMERS, icon: Users }
    ]
  },
  {
    title: "Supply Chain",
    icon: ShoppingBag,
    permission: PERMISSIONS.READ_PURCHASE_ORDERS,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glowColor: "shadow-sky-500/25",
    badge: "Elite",
    description: "Procurement powerhouse",
    children: [
      { title: "Purchase Orders", href: "/dashboard/purchase-orders", permission: PERMISSIONS.READ_PURCHASE_ORDERS, icon: Briefcase },
      { title: "Purchase Workflow", href: "/dashboard/purchaseOrderWorkflow", permission: PERMISSIONS.READ_PURCHASE_ORDERS, icon: Briefcase },
      { title: "Supplier Management", href: "/dashboard/purchases/suppliers", permission: PERMISSIONS.READ_SUPPLIERS, icon: Globe },
      { title: "Purchase Management", href: "/dashboard/purchases", permission: PERMISSIONS.READ_PURCHASE_ORDERS, icon: Package }
    ]
  },
  {
    title: "Intelligence Hub",
    icon: Activity,
    permission: PERMISSIONS.VIEW_ANALYTICS,
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    glowColor: "shadow-indigo-500/25",
    badge: "AI",
    description: "Data-driven insights",
    children: [
      { title: "Analytics Dashboard", href: "/dashboard/analytics", permission: PERMISSIONS.VIEW_ANALYTICS, icon: BarChart3 },
      { title: "Financial Reports", href: "/dashboard/app/reports/financial", permission: PERMISSIONS.VIEW_FINANCIAL_REPORTS, icon: BarChart3 },
      { title: "Inventory Reports", href: "/dashboard/app/reports/inventory", permission: PERMISSIONS.VIEW_INVENTORY_REPORTS, icon: TrendingUp },
      { title: "Sales Analytics", href: "/dashboard/app/reports/sales", permission: PERMISSIONS.VIEW_SALES_REPORTS, icon: Target }
    ]
  },
  {
    title: "Control Center",
    icon: Settings,
    permission: PERMISSIONS.VIEW_ORGANIZATION_SETTINGS,
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    glowColor: "shadow-slate-500/25",
    badge: "Admin",
    description: "System configuration",
    children: [
      { title: "General Settings", href: "/dashboard/app/settings", permission: PERMISSIONS.VIEW_ORGANIZATION_SETTINGS, icon: Building2 },
      { title: "Location Management", href: "/dashboard/settings/locations", permission: PERMISSIONS.MANAGE_LOCATION_SETTINGS, icon: Globe },
      { title: "Tax Configuration", href: "/dashboard/settings/tax-rates", permission: PERMISSIONS.MANAGE_ORGANIZATION, icon: DollarSign },
      { title: "User Management", href: "/dashboard/settings/users", permission: PERMISSIONS.READ_USERS, icon: Users }
    ]
  }
];


const ModernNavigation = ({ children }: { children: React.ReactNode }) => {
  const { session, status, hasPermission, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Team Universe', 'Inventory Galaxy']));
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Sync currentPath with actual pathname
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  // Trust middleware for auth protection - remove manual redirects
  // Middleware handles all authentication and authorization
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Authentication...</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

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
        <div
          onClick={() => {
            if (item.href) {
              router.push(item.href);
              setIsMobileOpen(false);
            } else if (item.children) {
              toggleExpanded(item.title);
            }
          }}
          onMouseEnter={() => setHoveredItem(item.title)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden cursor-pointer
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
          {/* Animated background glow */}
          {(isActive || isHovered) && !isChild && (
            <div className={`
              absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 rounded-2xl
              transition-opacity duration-300
            `} />
          )}

          {/* Icon with enhanced animations */}
          {Icon && (
            <div className={`
              flex-shrink-0 transition-all duration-300 relative z-10
              ${isActive ? 'scale-110 drop-shadow-lg' : isHovered ? 'scale-105 rotate-6' : ''}
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
                <Icon size={isChild ? 18 : 22} className={`
                  transition-all duration-300
                  ${isActive ? 'drop-shadow-sm' : ''}
                `} />

                {/* Pulsing dot for active state */}
                {isActive && !isChild && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Text content with smooth transitions */}
          <div className={`
            flex-1 transition-all duration-300 relative z-10 min-w-0
            ${isCollapsed && !isChild ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}
          `}>
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className={`
                  font-semibold transition-all duration-200 block truncate
                  ${isChild ? 'text-sm' : 'text-base'}
                  ${isActive ? 'text-shadow-sm' : ''}
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

              {/* Badge */}
              {item.badge && !isChild && !isCollapsed && (
                <span className={`
                  px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200
                  ${isActive
                    ? 'bg-white/20 text-white backdrop-blur-sm'
                    : 'bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700'
                  }
                `}>
                  {item.badge}
                </span>
              )}

              {/* Dropdown arrow */}
              {item.children && !isCollapsed && (
                <div className={`
                  ml-2 transition-all duration-300 relative z-10
                  ${isExpanded ? 'rotate-180' : 'rotate-0'}
                `}>
                  <ChevronDown size={16} className={`
                    ${isActive ? 'drop-shadow-sm' : ''}
                  `} />
                </div>
              )}
            </div>
          </div>

          {/* Hover tooltip for collapsed state */}
          {isCollapsed && !isChild && isHovered && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50 animate-in slide-in-from-left-2">
              <div className="font-medium">{item.title}</div>
              {item.description && (
                <div className="text-xs opacity-75">{item.description}</div>
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </div>

        {/* Enhanced animated dropdown with stagger effect */}
        {item.children && !isCollapsed && (
          <div className={`
            overflow-hidden transition-all duration-500 ease-out
            ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
          `}>
            <div className="space-y-1">
              {item.children
                .filter((child: { permission: string }) => hasPermission(child.permission))
                .map((child: { title: string; href?: string; permission: string; icon?: any }, index: number) => (
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
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar with enhanced design */}
      <div className={`
        hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-500
        ${isCollapsed ? 'w-24' : 'w-80'}
      `}>
        {/* Enhanced Header with animations */}
        <div className="relative p-6 border-b border-gray-100/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="relative">
              <div className={`
                w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl
                flex items-center justify-center shadow-xl shadow-emerald-500/25 transition-all duration-300
                ${isCollapsed ? 'scale-110' : 'scale-100'}
              `}>
                <Hexagon className="w-7 h-7 text-white drop-shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
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

        {/* Enhanced Organization Info */}
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
                <p className="font-bold text-gray-900 truncate text-lg">{session?.user?.organizationName || 'Organization'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    {session?.user?.roles?.[0]?.name || 'User'}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div className={`
            text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-300
            ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto mb-4'}
          `}>
            Navigation
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

        {/* Enhanced User Profile */}
        <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div className={`
            flex items-center gap-3 p-4 rounded-2xl bg-white shadow-lg border border-gray-200/50
            hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div className="relative">
              <img
                src={session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                alt={session?.user?.name || "User"}
                className="w-10 h-10 rounded-2xl object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden animate-in fade-in"
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
              <Hexagon className="w-6 h-6 text-white" />
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

      {/* Enhanced Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Stunning Top Navigation */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Enhanced Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-12 pr-6 py-3 w-80 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-200"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Enhanced Notifications */}
              <button className="relative p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-emerald-600 transition-colors" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white font-bold flex items-center justify-center shadow-lg animate-bounce">
                  3
                </span>
              </button>

              {/* Enhanced User Menu with Professional Dropdown */}
              <UserDropdownMenu
                username={session?.user?.name || 'User'}
                email={session?.user?.email || 'user@example.com'}
                avatarUrl={session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

      </div>
      <RouteDebugger />
    </div>
  );
};

export default ModernNavigation;
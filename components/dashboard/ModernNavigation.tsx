
"use client";

import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Cpu,
  Crown,
  Diamond,
  DollarSign,
  FileText,
  Gem,
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
  Wallet,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';

// Mock session data for demo
const mockSession = {
  user: {
    name: "Alexander Chen",
    email: "alex.chen@nexuscorp.com",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    organizationName: "NexusCorp Enterprise",
    organizationId: "NX-2024-PREMIUM",
    roles: [{ name: "Executive Admin" }],
    permissions: [
      "dashboard.read", "users.read", "roles.read", "inventory.read", "items.read",
      "categories.read", "brands.read", "units.read", "stock.read", "sales.read",
      "purchase.orders.read", "settings.read", "blogs.read", "orders.read", "reports.read"
    ]
  }
};

// Enhanced navigation configuration with captivating icons and effects
const navigationConfig = [
  {
    title: "Command Center",
    href: "/dashboard",
    icon: Cpu,
    permission: "dashboard.read",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    glowColor: "shadow-violet-500/25",
    badge: "New",
    description: "Central hub for all operations"
  },
  {
    title: "Team Universe",
    icon: Users2,
    permission: "users.read",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    glowColor: "shadow-rose-500/25",
    badge: "Hot",
    description: "Manage your dream team",
    children: [
      { title: "Elite Members", href: "/dashboard/users", permission: "users.read", icon: Crown },
      { title: "Power Roles", href: "/dashboard/settings/roles", permission: "roles.read", icon: Shield },
      { title: "My Profile", href: "/dashboard/profile", permission: "roles.read", icon: Star }
    ]
  },
  {
    title: "Inventory Galaxy",
    icon: Hexagon,
    permission: "inventory.read",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    glowColor: "shadow-emerald-500/25",
    badge: "Pro",
    description: "Your digital warehouse",
    children: [
      { title: "Product Arsenal", href: "/dashboard/inventory/items", permission: "items.read", icon: Package2 },
      { title: "Category Matrix", href: "/dashboard/inventory/categories", permission: "categories.read", icon: Layers },
      { title: "Brand Empire", href: "/dashboard/inventory/brands", permission: "brands.read", icon: Award },
      { title: "Stock Radar", href: "/dashboard/inventory/stock", permission: "stock.read", icon: Target },
      { title: "Alert System", href: "/dashboard/inventory/stock/low-stock", permission: "stock.read", icon: Bell },
      { title: "Transfer Hub", href: "/dashboard/inventory/transfers", permission: "transfers.read", icon: Orbit }
    ]
  },
  {
    title: "Revenue Engine",
    icon: Diamond,
    permission: "sales.read",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/25",
    badge: "$$",
    description: "Money-making machine",
    children: [
      { title: "Sales Command", href: "/dashboard/sales", permission: "sales.read", icon: TrendingUp },
      { title: "Order Matrix", href: "/dashboard/sales/orders", permission: "sales.orders.read", icon: FileText },
      { title: "POS Terminal", href: "/dashboard/pos", permission: "pos.read", icon: Zap },
      { title: "Client Base", href: "/dashboard/sales/customers", permission: "customers.read", icon: Users }
    ]
  },
  {
    title: "Supply Chain",
    icon: ShoppingBag,
    permission: "purchase.orders.read",
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    glowColor: "shadow-sky-500/25",
    badge: "Elite",
    description: "Procurement powerhouse",
    children: [
      { title: "Purchase Central", href: "/dashboard/purchase-orders", permission: "purchase.orders.read", icon: Briefcase },
      { title: "Vendor Network", href: "/dashboard/purchases/suppliers", permission: "suppliers.read", icon: Globe },
      { title: "Goods Portal", href: "/dashboard/purchases/goods.receipts", permission: "goods.receipts.read", icon: Package }
    ]
  },
  {
    title: "Intelligence Hub",
    icon: Activity,
    permission: "reports.read",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    glowColor: "shadow-indigo-500/25",
    badge: "AI",
    description: "Data-driven insights",
    children: [
      { title: "Product Intelligence", href: "/dashboard/reports/products", permission: "reports.read", icon: BarChart3 },
      { title: "Inventory Analytics", href: "/dashboard/reports/inventory", permission: "reports.read", icon: TrendingUp },
      { title: "Customer Insights", href: "/dashboard/reports/customers", permission: "reports.read", icon: Target }
    ]
  },
  {
    title: "Content Studio",
    href: "/dashboard/blogs",
    icon: BookOpen,
    permission: "blogs.read",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    glowColor: "shadow-pink-500/25",
    badge: "Creative",
    description: "Publishing powerhouse"
  },
  {
    title: "Order Universe",
    href: "/dashboard/orders",
    icon: Wallet,
    permission: "orders.read",
    gradient: "from-teal-500 via-green-500 to-emerald-500",
    glowColor: "shadow-teal-500/25",
    badge: "Live",
    description: "Order management hub"
  },
  {
    title: "Control Center",
    icon: Settings,
    permission: "settings.read",
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    glowColor: "shadow-slate-500/25",
    badge: "Admin",
    description: "System configuration",
    children: [
      { title: "Location Grid", href: "/dashboard/settings/locations", permission: "locations.read", icon: Globe },
      { title: "Tax Engine", href: "/dashboard/settings/tax-rates", permission: "tax.rates.read", icon: DollarSign },
      { title: "Company DNA", href: "/dashboard/settings/company", permission: "company.read", icon: Building2 }
    ]
  }
];


; // Replace with actual session hook if needed
const ModernNavigation = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Team Universe', 'Inventory Galaxy']));
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
        </button>

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
                w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-2xl 
                flex items-center justify-center shadow-xl shadow-violet-500/25 transition-all duration-300
                ${isCollapsed ? 'scale-110' : 'scale-100'}
              `}>
                <Gem className="w-7 h-7 text-white drop-shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl opacity-20 blur animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  NEXUS
                </h1>
                <p className="text-sm text-gray-500 font-medium">Enterprise Hub</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white shadow-lg border border-gray-200/50
              hover:shadow-xl hover:scale-105 transition-all duration-200
              ${isCollapsed ? '-right-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0' : ''}
            `}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Enhanced Organization Info */}
        {!isCollapsed && (
          <div className="px-6 py-5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50 border-b border-gray-100/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-purple-500/5" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-0.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl opacity-20 blur animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate text-lg">{mockSession.user.organizationName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg">
                    <Crown className="w-3 h-3 mr-1" />
                    {mockSession.user.roles[0].name}
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
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Gem className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-black text-xl bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              NEXUS
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
                className="p-3 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Enhanced Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-violet-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="pl-12 pr-6 py-3 w-80 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-200"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Enhanced Notifications */}
              <button className="relative p-3 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group">
                <Bell className="w-5 h-5 text-gray-600 group-hover:text-violet-600 transition-colors" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white font-bold flex items-center justify-center shadow-lg animate-bounce">
                  3
                </span>
              </button>

              {/* Enhanced User Menu */}
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer transition-all duration-200 group">
                <div className="relative">
                  <img
                    src={mockSession.user.image}
                    alt={mockSession.user.name}
                    className="w-10 h-10 rounded-2xl object-cover"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div className="hidden sm:block">
                  <p className="font-bold text-gray-900">{mockSession.user.name}</p>
                  <p className="text-xs text-gray-500">{mockSession.user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>
          </div>
        </header>

        <div className="md:ml-[220px] lg:ml-[280px]">
          <Navbar session={session} />
          <div className="p-8">{children}</div>
        </div>

        {/* Spectacular Main Content
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 relative overflow-hidden">
              {/* Background decoration 
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 rounded-3xl" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full blur-3xl" />

              <div className="text-center py-16 relative z-10">
                <div className="relative inline-block mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-violet-500/25">
                    <Cpu className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl opacity-20 blur animate-pulse" />
                </div>

                <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome to Command Center
                </h1>
                <p className="text-xl text-gray-600 mb-4">Your enterprise control hub is ready</p>
                <p className="text-gray-500 mb-12">Current route: <code className="bg-white/50 px-3 py-1 rounded-lg font-mono text-violet-600">{currentPath}</code></p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                  <div className="group p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 relative z-10">Team Universe</h3>
                    <p className="text-gray-600 relative z-10">Manage your elite team with advanced role-based controls and permissions.</p>
                  </div>

                  <div className="group p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 relative z-10">Inventory Galaxy</h3>
                    <p className="text-gray-600 relative z-10">Track, manage, and optimize your digital warehouse with AI-powered insights.</p>
                  </div>

                  <div className="group p-8 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/60 hover:shadow-2xl hover:scale-105 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl text-gray-900 mb-3 relative z-10">Intelligence Hub</h3>
                    <p className="text-gray-600 relative z-10">Get actionable insights with AI-powered analytics and comprehensive reporting.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                  <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-violet-600 mb-2">247</div>
                    <div className="text-sm text-gray-600 font-medium">Active Users</div>
                  </div>
                  <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-emerald-600 mb-2">1.2K</div>
                    <div className="text-sm text-gray-600 font-medium">Products</div>
                  </div>
                  <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-amber-600 mb-2">$89K</div>
                    <div className="text-sm text-gray-600 font-medium">Revenue</div>
                  </div>
                  <div className="text-center p-6 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20">
                    <div className="text-3xl font-black text-blue-600 mb-2">98%</div>
                    <div className="text-sm text-gray-600 font-medium">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main> */}
      </div>
    </div>
  );
};

export default ModernNavigation;
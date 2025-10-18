
"use client";

import { RouteDebugger } from '@/components/debug/RouteDebugger';
import UserDropdownMenu from '@/components/UserDropdownMenu';
import { navigationConfig, NavigationItem } from '@/components/dashboard/SidebarNavigation';
import { useAuth } from '@/lib/auth-unified';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BarChart3,
  Bell,
  Building2,
  Calculator,
  ChevronDown,
  ChevronRight,
  Command as CommandIcon,
  Crown,
  DollarSign,
  Download,
  Globe,
  HelpCircle,
  Hexagon,
  History,
  Menu,
  Monitor,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  X,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Types for enhanced navigation features
interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  category: string;
  keywords: string[];
}

interface RecentActivity {
  id: string;
  title: string;
  type: string;
  href: string;
  timestamp: Date;
  icon: any;
}

// Quick Actions Data with Search Keywords
const quickActions: QuickAction[] = [
  {
    id: "new-sale",
    title: "New Sale",
    description: "Start a new POS transaction",
    href: "/dashboard/app/sales/pos",
    icon: Monitor,
    color: "bg-green-500",
    category: "Sales",
    keywords: ["sale", "pos", "transaction", "payment", "checkout"],
  },
  {
    id: "add-product",
    title: "Add Product",
    description: "Add new item to inventory",
    href: "/dashboard/inventory/items/create",
    icon: Package,
    color: "bg-blue-500",
    category: "Inventory",
    keywords: ["product", "item", "inventory", "stock", "add"],
  },
  {
    id: "create-order",
    title: "Create Purchase Order",
    description: "New purchase order",
    href: "/dashboard/purchase-orders",
    icon: ShoppingCart,
    color: "bg-teal-500",
    category: "Purchases",
    keywords: ["purchase", "order", "supplier", "buy", "procurement"],
  },
  {
    id: "add-customer",
    title: "Add Customer",
    description: "Register new customer",
    href: "/dashboard/sales/customers/create",
    icon: Users,
    color: "bg-orange-500",
    category: "Customers",
    keywords: ["customer", "client", "contact", "register", "add"],
  },
  {
    id: "sales-report",
    title: "Sales Report",
    description: "View sales analytics",
    href: "/dashboard/app/sales",
    icon: BarChart3,
    color: "bg-teal-500",
    category: "Reports",
    keywords: ["report", "sales", "analytics", "statistics", "performance"],
  },
];

// Mock recent activities
const recentActivities: RecentActivity[] = [
  {
    id: "1",
    title: "Sale #12345 completed",
    type: "sale",
    href: "/dashboard/sales/12345",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    icon: DollarSign,
  },
  {
    id: "2",
    title: "Product updated",
    type: "inventory",
    href: "/dashboard/inventory",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    icon: Package,
  },
];

// Use the enhanced navigation configuration from SidebarNavigation


const ModernNavigation = ({ children }: { children: React.ReactNode }) => {
  const { session, status, hasPermission, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Dashboard']));
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync currentPath with actual pathname
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Prevent hydration mismatch by showing loading state on server and during initial client render
  if (!isClient || status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Authentication...</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set<string>();
    // If the clicked item is already expanded, close it (empty set)
    // If it's not expanded, open only this item
    if (!expandedItems.has(title)) {
      newExpanded.add(title);
    }
    setExpandedItems(newExpanded);
  };

  const filteredNavigation = navigationConfig.filter(item => {
    const hasItemPermission = hasPermission(item.permission);

    // Debug logging for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log(`Checking navigation item: ${item.title}`, {
        permission: item.permission,
        hasPermission: hasItemPermission,
        userPermissions: user?.permissions?.slice(0, 10), // Show more permissions
        hasWildcard: user?.permissions?.includes('*'),
        userRoles: user?.roles?.map(r => r.code || r.name),
        allUserPermissions: user?.permissions // Show ALL permissions for debugging
      });
    }

    // Temporary override for Payroll to debug
    if (item.title === "Payroll") {
      console.log("🔍 PAYROLL DEBUG:", {
        title: item.title,
        permission: item.permission,
        hasPermission: hasItemPermission,
        userHasPayrollRead: user?.permissions?.includes('PAYROLL_READ'),
        userHasWildcard: user?.permissions?.includes('*'),
        allPermissions: user?.permissions
      });

      // Temporarily show payroll for everyone to test
      return true;
    }

    if (!hasItemPermission) return false;
    if (item.children) {
      return item.children.some(child => hasPermission(child.permission));
    }
    return true;
  });

  const NavItem = ({ item, isChild = false }: { item: NavigationItem; isChild?: boolean }) => {
    const Icon = item.icon;
    const isExpanded = expandedItems.has(item.title);
    const isActive = currentPath === item.href ||
      (item.children && item.children.some((child) => child.href === currentPath));
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
              ? `bg-gradient-to-r ${item.gradient || 'from-gray-500 to-gray-600'} text-white shadow-2xl ${item.glowColor || 'shadow-gray-500/25'} transform scale-[1.02]`
              : isActive && isChild
                ? 'bg-gradient-to-r from-teal-500/10 to-cyan-500/10 text-teal-700 border border-teal-200/50 shadow-md'
                : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-lg hover:border hover:border-gray-200/50'
            }
            ${isChild ? 'ml-8 py-2.5' : ''}
            ${isCollapsed && !isChild ? 'justify-center' : ''}
          `}
        >
          {/* Animated background glow */}
          {(isActive || isHovered) && !isChild && (
            <div className={`
              absolute inset-0 bg-gradient-to-r ${item.gradient || 'from-gray-500 to-gray-600'} opacity-10 rounded-2xl
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
                    ? `bg-gradient-to-r ${item.gradient || 'from-gray-500 to-gray-600'} bg-opacity-10`
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
                    : 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700'
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
                .filter((child) => {
                  const childPermission = hasPermission(child.permission);
                  if (item.title === "Payroll") {
                    console.log("🔍 PAYROLL CHILD DEBUG:", {
                      childTitle: child.title,
                      childPermission: child.permission,
                      hasChildPermission: childPermission
                    });
                    return true; // Temporarily show all payroll children
                  }
                  return childPermission;
                })
                .map((child, index: number) => (
                  <div
                    key={child.title}
                    className={`
                      transition-all duration-300
                      ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                    `}
                    style={{ transitionDelay: isExpanded ? `${index * 50}ms` : '0ms' }}
                  >
                    <NavItem item={{
                      title: child.title,
                      href: child.href,
                      icon: child.icon || item.icon, // Use child icon or parent icon
                      permission: child.permission
                    }} isChild />
                  </div>
                ))
              }
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Global Search with Command Palette
  const GlobalSearch = () => {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Filter actions based on search term
    const filteredActions = quickActions.filter((action) =>
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Filter navigation items
    const filteredNavigation = navigationConfig.filter((item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);

    useEffect(() => {
      const down = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setOpen((open) => !open);
        }
      };

      document.addEventListener("keydown", down);
      return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSelect = (href: string) => {
      setOpen(false);
      router.push(href);
    };

    return (
      <>
        {/* Desktop Command Palette Trigger */}
        <div className="relative hidden md:block">
          <Button
            variant="outline"
            className="w-64 xl:w-80 justify-start text-muted-foreground bg-background/50 border-muted-foreground/20 hover:bg-background"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search everything...</span>
            <div className="ml-auto flex items-center gap-1">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </Button>
        </div>

        {/* Mobile Search */}
        <Button
          variant="outline"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Command Palette */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-[90vw] md:w-[600px] p-0" align="center">
            <Command>
              <CommandInput
                placeholder="Type a command or search..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {filteredActions.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {filteredActions.slice(0, 6).map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.title}
                        onSelect={() => handleSelect(action.href)}
                        className="flex items-center gap-3"
                      >
                        <div className={`p-1.5 rounded text-white ${action.color}`}>
                          <action.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {filteredNavigation.length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                      {filteredNavigation.map((item) => (
                        <CommandItem
                          key={item.title}
                          value={item.title}
                          onSelect={() => handleSelect(item.href || "#")}
                          className="flex items-center gap-3"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {recentActivities.length > 0 && searchTerm.length === 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Recent Activity">
                      {recentActivities.slice(0, 3).map((activity) => (
                        <CommandItem
                          key={activity.id}
                          value={activity.title}
                          onSelect={() => handleSelect(activity.href)}
                          className="flex items-center gap-3"
                        >
                          <activity.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </>
    );
  };

  // Business Metrics Component
  const BusinessMetrics = () => {
    const [metrics] = useState({
      todaySales: 12459.50,
      todayOrders: 28,
      lowStock: 5,
      pendingOrders: 3,
    });

    return (
      <div className="hidden xl:flex items-center gap-6 text-sm">
        <TooltipProvider>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-600">
                    ${metrics.todaySales.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Today's Sales Revenue</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-4" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-600">{metrics.todayOrders}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Today's Orders</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-4" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard/inventory">
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <Package className="h-4 w-4 text-orange-600" />
                    <span className="font-semibold text-orange-600">{metrics.lowStock}</span>
                  </div>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Low Stock Items</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    );
  };

  // Quick Actions Menu
  const QuickActionsMenu = () => {
    const [favoriteActions, setFavoriteActions] = useState<string[]>(['new-sale', 'add-product']);

    const toggleFavorite = (actionId: string) => {
      setFavoriteActions(prev =>
        prev.includes(actionId)
          ? prev.filter(id => id !== actionId)
          : [...prev, actionId]
      );
    };

    const categories = Array.from(new Set(quickActions.map(action => action.category)));

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hidden lg:flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Quick Actions
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96">
          <DropdownMenuLabel className="flex items-center justify-between">
            Quick Actions
            <Badge variant="outline" className="text-xs">
              {quickActions.length} available
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {favoriteActions.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Favorites</div>
              <div className="grid gap-1 p-2">
                {quickActions
                  .filter(action => favoriteActions.includes(action.id))
                  .map((action) => (
                    <Link key={action.id} href={action.href}>
                      <div className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer group">
                        <div className={`p-1.5 rounded text-white ${action.color}`}>
                          <action.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{action.title}</p>
                          <p className="text-xs text-muted-foreground">{action.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleFavorite(action.id);
                          }}
                        >
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </Button>
                      </div>
                    </Link>
                  ))}
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <ScrollArea className="max-h-80">
            {categories.map(category => (
              <div key={category}>
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">{category}</div>
                <div className="grid gap-1 p-2">
                  {quickActions
                    .filter(action => action.category === category)
                    .map((action) => (
                      <Link key={action.id} href={action.href}>
                        <div className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer group">
                          <div className={`p-1.5 rounded text-white ${action.color}`}>
                            <action.icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.title}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(action.id);
                            }}
                          >
                            <Star className={`h-3 w-3 ${
                              favoriteActions.includes(action.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`} />
                          </Button>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Enhanced Top Navigation Component
  const EnhancedTopNavigation = () => {
    // Get page title and breadcrumb
    const getPageInfo = () => {
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length >= 2) {
        const section = segments[1];
        const subsection = segments[2];

        const sectionNames: { [key: string]: string } = {
          dashboard: "Dashboard",
          inventory: "Inventory",
          sales: "Sales",
          purchases: "Purchases",
          pos: "Point of Sale",
          reports: "Reports",
          settings: "Settings",
          users: "Users",
        };

        const title = sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
        const breadcrumb = subsection
          ? `${title} › ${subsection.charAt(0).toUpperCase() + subsection.slice(1)}`
          : title;

        return { title, breadcrumb };
      }
      return { title: "Dashboard", breadcrumb: "Dashboard" };
    };

    const { title, breadcrumb } = getPageInfo();

    return (
      <TooltipProvider>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
          <div className="flex h-16 lg:h-[60px] items-center justify-between px-4 lg:px-6 w-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>

              {/* Page Title & Breadcrumb */}
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                <p className="text-xs text-muted-foreground">{breadcrumb}</p>
              </div>
            </div>

            {/* Center Section - Enhanced Search */}
            <div className="flex-1 max-w-lg xl:max-w-2xl mx-2 lg:mx-4">
              <GlobalSearch />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
              {/* Business Metrics */}
              <BusinessMetrics />

              {/* Organization Status */}
              <div className="hidden lg:flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground max-w-32 truncate">
                    {session?.user?.organizationName || "StockFlow Enterprise"}
                  </span>
                </div>

                <Separator orientation="vertical" className="h-4" />

                <Badge variant="secondary" className="text-xs">
                  {session?.user?.roles?.[0]?.name || "Admin"}
                </Badge>

                <Separator orientation="vertical" className="h-4" />

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>

              {/* Quick Actions */}
              <QuickActionsMenu />

              {/* Recent Activity */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden lg:flex">
                    <History className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Recent Activity</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <ScrollArea className="max-h-60">
                    {recentActivities.map((activity) => (
                      <DropdownMenuItem key={activity.id} asChild>
                        <Link href={activity.href} className="flex items-center gap-3 p-3">
                          <activity.icon className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {activity.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Enhanced Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs text-white font-bold flex items-center justify-center shadow-lg animate-bounce">
                  3
                </span>
              </Button>

              {/* Help & Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Help & Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/help/shortcuts">
                      <CommandIcon className="mr-2 h-4 w-4" />
                      Keyboard Shortcuts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help/documentation">
                      <Globe className="mr-2 h-4 w-4" />
                      Documentation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu - Keep the existing UserDropdownMenu */}
              <UserDropdownMenu
                username={session?.user?.name || 'User'}
                email={session?.user?.email || 'user@example.com'}
                avatarUrl={session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
              />
            </div>
          </div>

          {/* Optional Progress Bar for Loading States */}
          <div className="h-0.5 bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 opacity-0 transition-opacity duration-300" />
        </header>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
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
        {/* Enhanced Professional Top Navigation */}
        <EnhancedTopNavigation />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
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
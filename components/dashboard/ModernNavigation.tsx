
"use client";

import UserDropdownMenu from '@/components/UserDropdownMenu';
import { navigationConfig, NavigationItem } from '@/components/dashboard/SidebarNavigation';
import { useAuth } from '@/lib/auth-unified';
import { localizePath } from '@/i18n/routing';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Moon,
  Monitor,
  Package,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  Sun,
  TrendingUp,
  Users,
  X,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
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
  const { resolvedTheme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set(['Dashboard']));
  const [currentPath, setCurrentPath] = useState('/dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const userInitials = (session?.user?.name || "User")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const localePrefix = pathname.match(/^\/(en|fr)(?=\/)/)?.[1] ?? "en";
  const locale = localePrefix === "fr" ? "fr" : "en";
  const localizedHref = (href: string) => (href.startsWith("/") ? localizePath(href, locale) : href);
  const targetLocale = locale === "fr" ? "en" : "fr";
  const pathWithoutLocale = pathname.replace(/^\/(en|fr)(?=\/)/, "") || "/dashboard";
  const targetLocaleHref = `/${targetLocale}${pathWithoutLocale}`;
  const isDarkTheme = resolvedTheme === "dark";

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sync currentPath with actual pathname
  useEffect(() => {
    setCurrentPath(pathWithoutLocale);
  }, [pathWithoutLocale]);

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
              router.push(localizedHref(item.href));
              setIsMobileOpen(false);
            } else if (item.children) {
              toggleExpanded(item.title);
            }
          }}
          onMouseEnter={() => setHoveredItem(item.title)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden cursor-pointer border border-transparent
            ${isActive && !isChild
              ? 'bg-[rgba(47,125,246,0.18)] text-white border-white/10 shadow-[0_18px_42px_rgba(47,125,246,0.14)] transform scale-[1.01]'
              : isActive && isChild
                ? 'bg-[rgba(45,212,191,0.14)] text-[#e5fffb] border-white/10 shadow-md'
                : 'text-[#b9c8c3] hover:bg-white/[0.075] hover:text-white hover:border-white/10'
            }
            ${isChild ? 'ml-8 py-2.5' : ''}
            ${isCollapsed && !isChild ? 'justify-center' : ''}
          `}
        >
          {/* Animated background glow */}
          {(isActive || isHovered) && !isChild && (
            <div className={`
              absolute inset-0 bg-gradient-to-r from-[#2f7df6]/20 via-[#2dd4bf]/10 to-transparent rounded-xl
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
                  ? 'bg-[rgba(45,212,191,0.16)] text-[#7de8dc] backdrop-blur-sm'
                  : isHovered && !isChild
                    ? 'bg-white/[0.08] text-[#d7a84f]'
                    : 'bg-white/[0.055] text-[#8fb7ff]'
                }
              `}>
                <Icon size={isChild ? 18 : 22} className={`
                  transition-all duration-300
                  ${isActive ? 'drop-shadow-sm' : ''}
                `} />

                {/* Pulsing dot for active state */}
                {isActive && !isChild && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#2dd4bf] rounded-full shadow-sm animate-pulse" />
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
                  ${isActive ? 'text-shadow-sm text-white' : ''}
                `}>
                  {item.title}
                </span>
                {!isChild && !isCollapsed && item.description && (
                  <span className={`
                    text-xs opacity-75 block truncate transition-all duration-200
                    ${isActive ? 'text-white/80' : 'text-[#8fa4ab]'}
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
                    : 'bg-[rgba(215,168,79,0.16)] text-[#f0c76a]'
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
            <div className="absolute left-full ml-4 px-3 py-2 bg-[#0f171d] text-white text-sm rounded-lg border border-white/10 shadow-xl whitespace-nowrap z-50 animate-in slide-in-from-left-2">
              <div className="font-medium">{item.title}</div>
              {item.description && (
                <div className="text-xs text-[#9fb4bb]">{item.description}</div>
              )}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#0f171d] rotate-45 border-b border-l border-white/10" />
            </div>
          )}
        </div>

        {/* Enhanced animated dropdown with stagger effect */}
        {item.children && !isCollapsed && (
          <div className={`
            overflow-hidden transition-all duration-500 ease-out
            ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
          `}>
            <div className="space-y-1 rounded-xl border border-white/[0.06] bg-[#0e1a20]/55 py-1">
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
      router.push(localizedHref(href));
    };

    return (
      <>
        {/* Desktop Command Palette Trigger */}
        <div className="relative hidden md:block">
          <Button
            variant="outline"
            className="h-11 w-64 justify-start rounded-xl border-white/10 bg-white/[0.055] px-3 text-[#9fb4bb] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:border-[#5796ff]/50 hover:bg-white/[0.09] hover:text-white xl:w-80"
            onClick={() => setOpen(true)}
          >
            <Search className="mr-2 h-4 w-4 text-[#49c6e5]" />
            <span className="truncate">Search operations, inventory, sales...</span>
            <span className="ml-auto rounded-full border border-white/10 bg-white/[0.06] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#7de8dc]">
              Live
            </span>
          </Button>
        </div>

        {/* Mobile Search */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl border-white/10 bg-white/[0.06] text-[#d3ddd8] hover:bg-white/[0.1] hover:text-white md:hidden"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Command Palette */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div />
          </PopoverTrigger>
          <PopoverContent className="w-[92vw] overflow-hidden rounded-xl border border-white/10 bg-[#0f171d]/95 p-0 text-[#d3ddd8] shadow-[0_24px_70px_rgba(5,12,16,0.42)] backdrop-blur-xl md:w-[620px]" align="center">
            <Command className="bg-transparent text-[#d3ddd8] [&_[cmdk-group-heading]]:text-[#7f969f] [&_[cmdk-input-wrapper]]:border-white/10 [&_[cmdk-input-wrapper]]:bg-[#142129]/80 [&_[cmdk-input]]:text-white [&_[cmdk-input]]:placeholder:text-[#7f969f]">
              <CommandInput
                placeholder="Type a command or search..."
                value={searchTerm}
                onValueChange={setSearchTerm}
              />
              <CommandList className="max-h-[420px]">
                <CommandEmpty className="py-8 text-center text-sm text-[#9fb4bb]">No results found.</CommandEmpty>

                {filteredActions.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {filteredActions.slice(0, 6).map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.title}
                        onSelect={() => handleSelect(action.href)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#d3ddd8] data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white"
                      >
                        <div className={`rounded-lg p-1.5 text-white ${action.color}`}>
                          <action.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-[#8fa4ab]">{action.description}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {filteredNavigation.length > 0 && (
                  <>
                    <CommandSeparator className="bg-white/10" />
                    <CommandGroup heading="Navigation">
                      {filteredNavigation.map((item) => (
                        <CommandItem
                          key={item.title}
                          value={item.title}
                          onSelect={() => handleSelect(item.href || "#")}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#d3ddd8] data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white"
                        >
                          <item.icon className="h-4 w-4 text-[#8fb7ff]" />
                          <span>{item.title}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {recentActivities.length > 0 && searchTerm.length === 0 && (
                  <>
                    <CommandSeparator className="bg-white/10" />
                    <CommandGroup heading="Recent Activity">
                      {recentActivities.slice(0, 3).map((activity) => (
                        <CommandItem
                          key={activity.id}
                          value={activity.title}
                          onSelect={() => handleSelect(activity.href)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[#d3ddd8] data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-white"
                        >
                          <activity.icon className="h-4 w-4 text-[#49c6e5]" />
                          <div className="flex-1">
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-xs text-[#8fa4ab]">
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
      <div className="hidden items-center gap-2 text-sm 2xl:flex">
        <TooltipProvider>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(46,201,138,0.14)] text-[#76e3b0]">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-[#d8f8e9]">
                    ${metrics.todaySales.toLocaleString()}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Today&apos;s Sales Revenue</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 bg-white/10" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(47,125,246,0.16)] text-[#8fb7ff]">
                    <ShoppingCart className="h-4 w-4" />
                  </span>
                  <span className="font-semibold text-[#dbe8ff]">{metrics.todayOrders}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>Today&apos;s Orders</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 bg-white/10" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={localizedHref("/dashboard/inventory")}>
                  <div className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/[0.06]">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(215,168,79,0.16)] text-[#f0c76a]">
                      <Package className="h-4 w-4" />
                    </span>
                    <span className="font-semibold text-[#f0c76a]">{metrics.lowStock}</span>
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
          <Button variant="outline" size="sm" className="hidden h-10 items-center gap-2 rounded-xl border-white/10 bg-[rgba(45,212,191,0.11)] px-3 text-[#bff7f1] hover:border-[#2dd4bf]/40 hover:bg-[rgba(45,212,191,0.18)] hover:text-white 2xl:flex">
            <Zap className="h-4 w-4 text-[#2dd4bf]" />
            Quick Actions
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 rounded-xl border-white/10 bg-[#0f171d]/95 p-2 text-[#d3ddd8] shadow-[0_24px_70px_rgba(5,12,16,0.42)] backdrop-blur-xl">
          <DropdownMenuLabel className="flex items-center justify-between text-white">
            Quick Actions
            <Badge variant="outline" className="border-white/10 bg-white/[0.06] text-xs text-[#7de8dc]">
              {quickActions.length} available
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />

          {favoriteActions.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#7f969f]">Favorites</div>
              <div className="grid gap-1 p-2">
                {quickActions
                  .filter(action => favoriteActions.includes(action.id))
                  .map((action) => (
                    <Link key={action.id} href={action.href}>
                      <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.07]">
                        <div className={`rounded-lg p-1.5 text-white ${action.color}`}>
                          <action.icon className="h-3 w-3" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{action.title}</p>
                          <p className="text-xs text-[#8fa4ab]">{action.description}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-[#f0c76a] opacity-0 hover:bg-white/[0.08] group-hover:opacity-100"
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
              <DropdownMenuSeparator className="bg-white/10" />
            </>
          )}

          <ScrollArea className="max-h-80">
            {categories.map(category => (
              <div key={category}>
                <div className="px-2 py-1 text-xs font-medium uppercase tracking-[0.12em] text-[#7f969f]">{category}</div>
                <div className="grid gap-1 p-2">
                  {quickActions
                    .filter(action => action.category === category)
                    .map((action) => (
                      <Link key={action.id} href={action.href}>
                        <div className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.07]">
                          <div className={`rounded-lg p-1.5 text-white ${action.color}`}>
                            <action.icon className="h-3 w-3" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{action.title}</p>
                            <p className="text-xs text-[#8fa4ab]">{action.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-[#f0c76a] opacity-0 hover:bg-white/[0.08] group-hover:opacity-100"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(action.id);
                            }}
                          >
                            <Star className={`h-3 w-3 ${
                              favoriteActions.includes(action.id)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-[#7f969f]"
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
        <header className="sticky top-0 z-50 isolate w-full overflow-hidden border-b border-white/10 bg-[#142129]/90 shadow-[0_20px_45px_rgba(5,12,16,0.22)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(73,198,229,0.12),transparent_28%),radial-gradient(circle_at_88%_0%,rgba(215,168,79,0.11),transparent_24%)]" />
          <div className="relative flex min-h-16 w-full max-w-full items-center justify-between gap-2 px-2 sm:px-4 lg:h-[68px] lg:px-5">
            {/* Left Section */}
            <div className="flex min-w-0 items-center gap-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-xl border-white/10 bg-white/[0.06] text-[#d3ddd8] hover:bg-white/[0.1] hover:text-white md:hidden"
                onClick={() => setIsMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>

              {/* Page Title & Breadcrumb */}
              <div className="hidden min-w-0 sm:block">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(47,125,246,0.16)] text-[#8fb7ff] ring-1 ring-white/10">
                    <Monitor className="h-4 w-4" />
                  </span>
                  <h1 className="truncate text-lg font-bold text-white">{title}</h1>
                </div>
                <p className="mt-0.5 truncate text-xs font-medium text-[#8fa4ab]">{breadcrumb}</p>
              </div>
            </div>

            {/* Center Section - Enhanced Search */}
            <div className="mx-1 hidden min-w-0 max-w-lg flex-1 justify-center 2xl:flex 2xl:max-w-2xl">
              <GlobalSearch />
            </div>

            {/* Right Section */}
            <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
              {/* Business Metrics */}
              <BusinessMetrics />

              {/* Organization Status */}
              <div className="hidden items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] 2xl:flex">
                <div className="flex min-w-0 items-center gap-2">
                  <Building2 className="h-4 w-4 shrink-0 text-[#f0c76a]" />
                  <span className="max-w-32 truncate font-medium text-[#d3ddd8]">
                    {session?.user?.organizationName || "StockFlow Enterprise"}
                  </span>
                </div>

                <Separator orientation="vertical" className="h-5 bg-white/10" />

                <Badge variant="secondary" className="border border-white/10 bg-[rgba(45,212,191,0.14)] text-xs text-[#7de8dc] hover:bg-[rgba(45,212,191,0.18)]">
                  {session?.user?.roles?.[0]?.name || "Admin"}
                </Badge>

                <Separator orientation="vertical" className="h-5 bg-white/10" />

                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#2ec98a] shadow-[0_0_0_4px_rgba(46,201,138,0.14)] animate-pulse"></div>
                  <span className="text-xs font-medium text-[#9fb4bb]">Online</span>
                </div>
              </div>

              {/* Quick Actions */}
              <QuickActionsMenu />

              {/* Language */}
              <Link
                href={targetLocaleHref}
                className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-0 text-sm font-semibold uppercase text-[#d3ddd8] transition-all hover:bg-white/[0.09] hover:text-white sm:w-auto sm:px-3"
                aria-label={`Switch language to ${targetLocale.toUpperCase()}`}
              >
                <Globe className="h-4 w-4 text-[#8fb7ff]" />
                <span className="hidden sm:inline">{targetLocale}</span>
              </Link>

              {/* Theme */}
              <button
                type="button"
                onClick={() => setTheme(isDarkTheme ? "light" : "dark")}
                className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-0 text-sm font-semibold text-[#d3ddd8] transition-all hover:bg-white/[0.09] hover:text-white 2xl:w-auto 2xl:px-3"
                aria-label={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
              >
                {isDarkTheme ? (
                  <Sun className="h-4 w-4 text-[#f0c76a]" />
                ) : (
                  <Moon className="h-4 w-4 text-[#8fb7ff]" />
                )}
                <span className="hidden 2xl:inline">{isDarkTheme ? "Light" : "Dark"}</span>
              </button>

              {/* Recent Activity */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-xl border border-white/10 bg-white/[0.045] text-[#d3ddd8] hover:bg-white/[0.09] hover:text-white 2xl:flex">
                    <History className="h-5 w-5 text-[#8fb7ff]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-xl border-white/10 bg-[#0f171d]/95 p-2 text-[#d3ddd8] shadow-[0_24px_70px_rgba(5,12,16,0.42)] backdrop-blur-xl">
                  <DropdownMenuLabel className="text-white">Recent Activity</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <ScrollArea className="max-h-60">
                    {recentActivities.map((activity) => (
                      <DropdownMenuItem key={activity.id} asChild>
                        <Link href={localizedHref(activity.href)} className="flex items-center gap-3 rounded-lg p-3 text-[#d3ddd8] focus:bg-white/[0.08] focus:text-white">
                          <activity.icon className="h-4 w-4 text-[#49c6e5]" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-[#8fa4ab]">
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
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl border border-white/10 bg-white/[0.045] text-[#d3ddd8] hover:bg-white/[0.09] hover:text-white">
                <Bell className="h-5 w-5 text-[#f0c76a]" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#ef6a6a] to-[#d7a84f] text-xs font-bold text-white shadow-lg">
                  3
                </span>
              </Button>

              {/* Help & Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-xl border border-white/10 bg-white/[0.045] text-[#d3ddd8] hover:bg-white/[0.09] hover:text-white sm:flex">
                    <HelpCircle className="h-5 w-5 text-[#9fb4bb]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl border-white/10 bg-[#0f171d]/95 p-2 text-[#d3ddd8] shadow-[0_24px_70px_rgba(5,12,16,0.42)] backdrop-blur-xl">
                  <DropdownMenuLabel className="text-white">Help & Settings</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="rounded-lg focus:bg-white/[0.08] focus:text-white">
                    <Link href={localizedHref("/help/shortcuts")}>
                      <CommandIcon className="mr-2 h-4 w-4 text-[#8fb7ff]" />
                      Command Center
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg focus:bg-white/[0.08] focus:text-white">
                    <Link href={localizedHref("/help/documentation")}>
                      <Globe className="mr-2 h-4 w-4 text-[#49c6e5]" />
                      Documentation
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg focus:bg-white/[0.08] focus:text-white">
                    <Link href={localizedHref("/dashboard/settings")}>
                      <Settings className="mr-2 h-4 w-4 text-[#f0c76a]" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="rounded-lg focus:bg-white/[0.08] focus:text-white">
                    <Download className="mr-2 h-4 w-4 text-[#7de8dc]" />
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
    <div className="flex h-screen min-w-0 overflow-hidden bg-[#111a20]">
      {/* Desktop Sidebar with enhanced design */}
      <div className={`
        dashboard-enterprise-sidebar z-30 hidden shrink-0 overflow-hidden border-r md:flex transition-all duration-500
        ${isCollapsed ? 'w-24' : 'w-80'}
      `}>
        <div className="relative z-10 flex h-full min-h-0 flex-col">
        {/* Enhanced Header with animations */}
        <div className="relative border-b border-white/10 p-6">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'justify-center' : 'gap-4'}`}>
            <div className="relative">
              <div className={`
                w-12 h-12 rounded-2xl bg-[rgba(47,125,246,0.18)] text-[#8fb7ff] ring-1 ring-white/10
                flex items-center justify-center shadow-[0_16px_36px_rgba(47,125,246,0.18)] transition-all duration-300
                ${isCollapsed ? 'scale-110' : 'scale-100'}
              `}>
                <Hexagon className="w-7 h-7 drop-shadow-sm" />
                <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#2dd4bf] shadow-[0_0_0_4px_rgba(45,212,191,0.14)]" />
              </div>
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#2f7df6] to-[#2dd4bf] opacity-20 blur animate-pulse" />
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h1 className="font-black text-2xl tracking-[0.08em] text-white">
                  STOCKFLOW
                </h1>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9fb4bb]">Enterprise OS</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`
              absolute right-4 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/[0.07] p-2 text-[#d3ddd8]
              shadow-lg hover:bg-white/[0.12] hover:text-white hover:shadow-xl hover:scale-105 transition-all duration-200
              ${isCollapsed ? '-right-4 border-0 bg-gradient-to-r from-[#2f7df6] to-[#2dd4bf] text-white' : ''}
            `}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Enhanced Organization Info */}
        {!isCollapsed && (
          <div className="relative overflow-hidden border-b border-white/10 bg-white/[0.045] px-6 py-5">
            <div className="absolute inset-0 bg-gradient-to-r from-[#2f7df6]/10 via-[#2dd4bf]/8 to-[#d7a84f]/10" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(215,168,79,0.16)] text-[#f0c76a] shadow-lg ring-1 ring-white/10">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[#d7a84f] to-[#2dd4bf] opacity-20 blur animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-lg font-bold text-white">{session?.user?.organizationName || 'Organization'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-full bg-[rgba(45,212,191,0.14)] px-3 py-1 text-xs font-bold text-[#7de8dc] ring-1 ring-white/10">
                    <Crown className="w-3 h-3 mr-1" />
                    {session?.user?.roles?.[0]?.name || 'User'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/[0.07] px-2 py-1 text-xs font-medium text-[#9fb4bb]">
                    <div className="w-2 h-2 bg-[#2ec98a] rounded-full mr-1 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Navigation */}
        <nav className="dashboard-sidebar-scroll min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
          <div className={`
            text-xs font-bold text-[#7f969f] uppercase tracking-[0.18em] transition-all duration-300
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
        <div className="border-t border-white/10 p-4">
          <div className={`
            flex items-center gap-3 rounded-xl border border-white/10 bg-[#0e1a20]/70 p-4 shadow-lg
            hover:bg-white/[0.075] hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group
            ${isCollapsed ? 'justify-center' : ''}
          `}>
            <div className="relative">
              <Avatar className="h-10 w-10 rounded-xl shadow-md ring-2 ring-white/10">
                <AvatarImage
                  src={session?.user?.image || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"}
                  alt={session?.user?.name || "User"}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-[#2f7df6] to-[#2dd4bf] text-sm font-bold text-white">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2ec98a] border-2 border-[#0e1a20] rounded-full shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-[#8fa4ab] truncate">{session?.user?.email || 'user@example.com'}</p>
              </div>
            )}
          </div>
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
        dashboard-enterprise-sidebar fixed left-0 top-0 z-50 h-full w-80 overflow-hidden border-r border-white/10 shadow-2xl
        transform transition-all duration-500 md:hidden
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="relative z-10 flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(47,125,246,0.18)] text-[#8fb7ff] shadow-xl ring-1 ring-white/10">
              <Hexagon className="w-6 h-6" />
            </div>
            <h1 className="font-black text-xl tracking-[0.08em] text-white">
              STOCKFLOW
            </h1>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[#d3ddd8] transition-all duration-200 hover:bg-white/[0.12] hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="dashboard-sidebar-scroll min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
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
      </div>

      {/* Enhanced Main Content */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Enhanced Professional Top Navigation */}
        <EnhancedTopNavigation />

        {/* Main Content */}
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl min-w-0">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default ModernNavigation;

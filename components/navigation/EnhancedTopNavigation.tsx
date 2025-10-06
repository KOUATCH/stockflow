"use client";

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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { sidebarLinks } from "@/config/sidebar";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Bookmark,
  Building2,
  Calculator,
  ChevronDown,
  Clock,
  Command as CommandIcon,
  DollarSign,
  Download,
  Globe,
  HelpCircle,
  History,
  LayoutDashboard,
  Menu,
  Monitor,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "../global/Logo";
import { NotificationMenu } from "../NotificationMenu";
import UserDropdownMenu from "../UserDropdownMenu";
import { useNotifications } from "../notifications/NotificationProvider";

// Types
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
    href: "/dashboard/pos",
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
    href: "/dashboard/purchase-orders/create",
    icon: ShoppingCart,
    color: "bg-purple-500",
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
    href: "/dashboard/reports/sales",
    icon: BarChart3,
    color: "bg-indigo-500",
    category: "Reports",
    keywords: ["report", "sales", "analytics", "statistics", "performance"],
  },
  {
    id: "stock-adjustment",
    title: "Stock Adjustment",
    description: "Adjust inventory levels",
    href: "/dashboard/inventory/adjustments/create",
    icon: Calculator,
    color: "bg-red-500",
    category: "Inventory",
    keywords: ["stock", "adjustment", "inventory", "count", "reconcile"],
  },
];

// Mock recent activities (in real app, this would come from API)
const recentActivities: RecentActivity[] = [
  {
    id: "1",
    title: "Sale #12345 completed",
    type: "sale",
    href: "/dashboard/sales/12345",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    icon: DollarSign,
  },
  {
    id: "2",
    title: "Product 'Coffee Beans' updated",
    type: "inventory",
    href: "/dashboard/inventory/items/coffee-beans",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    icon: Package,
  },
  {
    id: "3",
    title: "Purchase Order #PO-789 received",
    type: "purchase",
    href: "/dashboard/purchase-orders/PO-789",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    icon: ShoppingCart,
  },
];

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
              <Link href="/dashboard/inventory/stock/low-stock">
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

// Advanced Global Search with Command Palette
const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Filter actions based on search term
  const filteredActions = quickActions.filter((action) =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filter navigation items
  const filteredNavigation = sidebarLinks.filter((item) =>
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
                      <div className={cn("p-1.5 rounded text-white", action.color)}>
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

// Organization Status Component
const OrganizationStatus = ({ session }: { session: any }) => {
  const organizationName = session?.user?.organizationName || "StockFlow Enterprise";
  const userRole = session?.user?.roles?.[0]?.name || "Admin";
  const [isOnline] = useState(true);

  return (
    <div className="hidden lg:flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground max-w-32 truncate">{organizationName}</span>
      </div>

      <Separator orientation="vertical" className="h-4" />

      <Badge variant="secondary" className="text-xs">
        {userRole}
      </Badge>

      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
        )}></div>
        <span className="text-xs text-muted-foreground">
          {isOnline ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  );
};

// Enhanced Quick Actions Menu
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

        {/* Favorites */}
        {favoriteActions.length > 0 && (
          <>
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Favorites</div>
            <div className="grid gap-1 p-2">
              {quickActions
                .filter(action => favoriteActions.includes(action.id))
                .map((action) => (
                  <Link key={action.id} href={action.href}>
                    <div className="flex items-center gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer group">
                      <div className={cn("p-1.5 rounded text-white", action.color)}>
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

        {/* All Actions by Category */}
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
                        <div className={cn("p-1.5 rounded text-white", action.color)}>
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
                          <Star className={cn(
                            "h-3 w-3",
                            favoriteActions.includes(action.id)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )} />
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

interface EnhancedTopNavigationProps {
  session: any;
  notifications?: any[];
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
  className?: string;
}

export default function EnhancedTopNavigation({
  session,
  notifications = [],
  onMenuToggle,
  showMobileMenu = true,
  className,
}: EnhancedTopNavigationProps) {
  const pathname = usePathname();

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
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm",
        className
      )}>
        <div className="flex h-16 lg:h-[60px] items-center justify-between px-4 lg:px-6 w-full">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            {showMobileMenu && onMenuToggle && (
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={onMenuToggle}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            )}

            {/* Desktop Logo (only show if no sidebar) */}
            {!showMobileMenu && (
              <div className="hidden md:block">
                <Logo href="/dashboard" />
              </div>
            )}

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
            <OrganizationStatus session={session} />

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

            {/* Notifications */}
            <div className="relative">
              <NotificationMenu notifications={notifications} />
            </div>

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

            {/* User Menu */}
            <UserDropdownMenu
              username={session?.user?.name ?? ""}
              email={session?.user?.email ?? ""}
              avatarUrl={
                session?.user?.image ??
                "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%20(54)-NX3G1KANQ2p4Gupgnvn94OQKsGYzyU.png"
              }
            />
          </div>
        </div>

        {/* Optional Progress Bar for Loading States */}
        <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-0 transition-opacity duration-300" />
      </header>
    </TooltipProvider>
  );
}
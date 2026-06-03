"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getLocaleFromPathname, localizePath } from "@/i18n/routing";
import { DEFAULT_LOCALE } from "@/types/bilingual";
import {
  Bell,
  Building2,
  ChevronDown,
  Globe,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Monitor,
  Search,
  Settings,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "../global/Logo";
import { NotificationMenu } from "../NotificationMenu";
import UserDropdownMenu from "../UserDropdownMenu";
import { useNotifications } from "../notifications/NotificationProvider";

// Quick Actions Data
const quickActions = [
  {
    title: "New Sale",
    description: "Start a new POS transaction",
    href: "/dashboard/pos",
    icon: Monitor,
    color: "bg-green-500",
  },
  {
    title: "Add Product",
    description: "Add new item to inventory",
    href: "/dashboard/inventory/items/create",
    icon: LayoutDashboard,
    color: "bg-blue-500",
  },
  {
    title: "Create Order",
    description: "New purchase order",
    href: "/dashboard/purchase-orders/create",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
  {
    title: "Add Customer",
    description: "Register new customer",
    href: "/dashboard/sales/customers/create",
    icon: Users,
    color: "bg-orange-500",
  },
];

// System Status Component
const SystemStatus = () => {
  const [isOnline] = useState(true);
  const [lastSync] = useState(new Date());

  return (
    <div className="hidden lg:flex items-center space-x-4 text-sm">
      <div className="flex items-center space-x-2">
        <div className={cn(
          "w-2 h-2 rounded-full",
          isOnline ? "bg-green-500 animate-pulse" : "bg-red-500"
        )}></div>
        <span className="text-muted-foreground font-medium">
          {isOnline ? "System Online" : "System Offline"}
        </span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="text-muted-foreground">
        Last sync: {lastSync.toLocaleTimeString()}
      </div>
    </div>
  );
};

// Quick Actions Menu
const QuickActionsMenu = () => {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="hidden md:flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Quick Actions
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-80">
          <div className="grid gap-2 p-2">
            {quickActions.map((action, index) => (
              <Link key={index} href={localizedHref(action.href)}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <div className={cn("p-2 rounded-md text-white", action.color)}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Organization Info Component
const OrganizationInfo = ({ session }: { session: any }) => {
  const organizationName = session?.user?.organizationName || "StockFlow Enterprise";
  const userRole = session?.user?.roles?.[0]?.name || "Admin";
  const organizationId = session?.user?.organizationId || "";

  return (
    <div className="hidden xl:flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium text-foreground">{organizationName}</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <Badge variant="secondary" className="text-xs">
        {userRole}
      </Badge>
      {organizationId && (
        <>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">ID: {organizationId.slice(-8)}</span>
        </>
      )}
    </div>
  );
};

// Global Search Component
const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      {/* Desktop Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products, orders, customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 w-64 xl:w-80 bg-background/50 border-muted-foreground/20 focus:border-primary/50 focus:bg-background"
        />
        {searchTerm && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-4 text-sm text-muted-foreground">
              Search results for &quot;{searchTerm}&quot; would appear here...
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search */}
      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Search className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="top" className="h-auto">
          <SheetHeader>
            <SheetTitle>Search</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search products, orders, customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

// Help & Support Menu
const HelpMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="hidden lg:flex">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/help/documentation">
            <Globe className="mr-2 h-4 w-4" />
            Documentation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help/tutorials">
            <Monitor className="mr-2 h-4 w-4" />
            Video Tutorials
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help/support">
            <HelpCircle className="mr-2 h-4 w-4" />
            Contact Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Keyboard Shortcuts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface TopNavigationProps {
  session: any;
  notifications?: any[];
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

export default function TopNavigation({
  session,
  notifications = [],
  onMenuToggle,
  showMobileMenu = true,
}: TopNavigationProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE;
  const localizedHref = (href: string) => localizePath(href, locale);
  const { info } = useNotifications();

  // Get page title based on current pathname
  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const section = segments[1];
      const subsection = segments[2];

      const sectionNames: { [key: string]: string } = {
        dashboard: "Dashboard",
        inventory: "Inventory Management",
        sales: "Sales & Orders",
        purchases: "Purchase Orders",
        pos: "Point of Sale",
        reports: "Reports & Analytics",
        settings: "System Settings",
        users: "User Management",
      };

      const title = sectionNames[section] || section.charAt(0).toUpperCase() + section.slice(1);
      return subsection ? `${title} › ${subsection.charAt(0).toUpperCase() + subsection.slice(1)}` : title;
    }
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 lg:h-[60px] items-center justify-between px-4 lg:px-6">
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
              <Logo href={localizedHref("/dashboard")} />
            </div>
          )}

          {/* Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">{getPageTitle()}</h1>
          </div>

          {/* Organization Info */}
          <OrganizationInfo session={session} />
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <GlobalSearch />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* System Status */}
          <SystemStatus />

          {/* Quick Actions */}
          <QuickActionsMenu />

          {/* Help Menu */}
          <HelpMenu />

          {/* Notifications */}
          <div className="relative">
            <NotificationMenu notifications={notifications} />
          </div>

          {/* Settings Quick Access */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden lg:flex">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Quick Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={localizedHref("/dashboard/settings/company")}>
                  Company Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={localizedHref("/dashboard/settings/locations")}>
                  Locations
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={localizedHref("/dashboard/settings/tax-rates")}>
                  Tax Rates
                </Link>
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

      {/* Progress Bar (optional - for page loading states) */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-0 transition-opacity duration-300" />
    </header>
  );
}

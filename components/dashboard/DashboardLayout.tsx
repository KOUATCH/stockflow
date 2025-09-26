"use client"

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { BarChart3, Package, ShoppingCart, Users, CreditCard, TrendingUp, Settings, Bell, Search, Menu, Home, Warehouse, FileText, ArrowUpDown, Calculator, PieChart, UserCheck, Building2, Truck, ClipboardList, DollarSign, Receipt, Monitor, Zap, ChevronDown, LogOut, User, HelpCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    current: false,
  },
  {
    name: 'Inventory',
    icon: Package,
    current: false,
    children: [
      { name: 'Overview', href: '/dashboard/inventory' },
      { name: 'Items', href: '/dashboard/inventory/items' },
      { name: 'Categories', href: '/dashboard/inventory/categories' },
      { name: 'Adjustments', href: '/dashboard/inventory/adjustments' },
      { name: 'Transfers', href: '/dashboard/inventory/transfers' },
      { name: 'Reports', href: '/dashboard/inventory/reports' },
    ],
  },
  {
    name: 'Sales',
    icon: ShoppingCart,
    current: false,
    children: [
      { name: 'Overview', href: '/dashboard/sales' },
      { name: 'Orders', href: '/dashboard/sales/orders' },
      { name: 'Customers', href: '/dashboard/customers' },
      { name: 'Analytics', href: '/dashboard/sales/analytics' },
    ],
  },
  {
    name: 'Point of Sale',
    href: '/dashboard/pos',
    icon: Monitor,
    current: false,
    badge: 'Live',
  },
  {
    name: 'Purchase Orders',
    icon: FileText,
    current: false,
    children: [
      { name: 'Overview', href: '/dashboard/purchase-orders' },
      { name: 'Create Order', href: '/dashboard/purchase-orders/create' },
      { name: 'Suppliers', href: '/dashboard/suppliers' },
      { name: 'Receipts', href: '/dashboard/purchase-orders/receipts' },
    ],
  },
  {
    name: 'Financial',
    icon: DollarSign,
    current: false,
    children: [
      { name: 'Overview', href: '/dashboard/financial' },
      { name: 'Payments', href: '/dashboard/financial/payments' },
      { name: 'Reports', href: '/dashboard/financial/reports' },
      { name: 'Cash Flow', href: '/dashboard/financial/cash-flow' },
    ],
  },
  {
    name: 'Reports',
    icon: BarChart3,
    current: false,
    children: [
      { name: 'Sales Reports', href: '/dashboard/reports/sales' },
      { name: 'Inventory Reports', href: '/dashboard/reports/inventory' },
      { name: 'Financial Reports', href: '/dashboard/reports/financial' },
      { name: 'Custom Reports', href: '/dashboard/reports/custom' },
    ],
  },
  {
    name: 'Settings',
    icon: Settings,
    current: false,
    children: [
      { name: 'Organization', href: '/dashboard/settings/organization' },
      { name: 'Locations', href: '/dashboard/settings/locations' },
      { name: 'Users & Roles', href: '/dashboard/settings/users' },
      { name: 'Integrations', href: '/dashboard/settings/integrations' },
    ],
  },
]

function NavigationItem({ item, isCollapsed = false }: { item: any; isCollapsed?: boolean }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  
  const isActive = item.href ? pathname === item.href : item.children?.some((child: any) => pathname === child.href)
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-10 px-3',
            isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700',
            isCollapsed && 'px-2'
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <item.icon className={cn('h-4 w-4', isCollapsed ? '' : 'mr-3')} />
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left">{item.name}</span>
              <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
            </>
          )}
        </Button>
        {!isCollapsed && isOpen && (
          <div className="ml-6 space-y-1">
            {item.children.map((child: any) => (
              <Link key={child.href} href={child.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-9 px-3 text-sm',
                    pathname === child.href && 'bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700'
                  )}
                >
                  {child.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link href={item.href}>
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start h-10 px-3',
          isActive && 'bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700',
          isCollapsed && 'px-2'
        )}
      >
        <item.icon className={cn('h-4 w-4', isCollapsed ? '' : 'mr-3')} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.name}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  )
}

function Sidebar({ isCollapsed = false }: { isCollapsed?: boolean }) {
  return (
    <div className={cn('flex flex-col h-full', isCollapsed ? 'w-16' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                InvenFlow
              </h1>
              <p className="text-xs text-muted-foreground">Business Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavigationItem key={item.name} item={item} isCollapsed={isCollapsed} />
          ))}
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn('w-full justify-start h-12', isCollapsed && 'px-2')}>
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="ml-3 flex-1 text-left">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col">
        <div className="bg-white border-r shadow-sm">
          <Sidebar isCollapsed={sidebarCollapsed} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="bg-white h-full">
            <Sidebar />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className={cn('lg:pl-64', sidebarCollapsed && 'lg:pl-16')}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <div className="bg-white h-full">
                    <Sidebar />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop collapse button */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden lg:flex"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Search */}
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                  3
                </Badge>
              </Button>

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-muted-foreground">System Online</span>
                </div>
                <div className="text-muted-foreground">|</div>
                <div className="font-medium">$12,345 Today</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

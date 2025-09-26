"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Package, BarChart3, ShoppingCart, Users, Settings, Menu, Home, Truck } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Inventory",
    icon: Package,
    children: [
      { name: "Items", href: "/inventory/items" },
      { name: "Categories", href: "/inventory/categories" },
      { name: "Brands", href: "/inventory/brands" },
      { name: "Stock Levels", href: "/inventory/levels" },
      { name: "Adjustments", href: "/inventory/adjustments" },
      { name: "Transfers", href: "/inventory/transfers" },
    ],
  },
  {
    name: "Sales",
    icon: ShoppingCart,
    children: [
      { name: "Orders", href: "/sales/orders" },
      { name: "POS Terminal", href: "/sales/pos" },
      { name: "Customers", href: "/sales/customers" },
      { name: "Payments", href: "/sales/payments" },
    ],
  },
  {
    name: "Purchases",
    icon: Truck,
    children: [
      { name: "Orders", href: "/purchases/orders" },
      { name: "Suppliers", href: "/purchases/suppliers" },
      { name: "Receipts", href: "/purchases/receipts" },
    ],
  },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      { name: "Sales Analytics", href: "/reports/sales" },
      { name: "Inventory Reports", href: "/reports/inventory" },
      { name: "Financial Reports", href: "/reports/financial" },
    ],
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]))
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2 font-heading font-bold text-lg">
          <Package className="h-6 w-6 text-primary" />
          InventoryPro
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isExpanded = expandedItems.includes(item.name)
            const hasChildren = item.children && item.children.length > 0

            if (hasChildren) {
              return (
                <div key={item.name}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isExpanded && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                    onClick={() => toggleExpanded(item.name)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                  {isExpanded && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                              pathname === child.href && "bg-sidebar-primary text-sidebar-primary-foreground",
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
              <Link key={item.name} href={item.href!}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-sidebar", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}

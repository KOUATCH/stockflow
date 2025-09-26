"use client"

import {
  BarChart3,
  Calendar,
  CreditCard,
  HelpCircle,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthenticatedUser } from "@/config/useAuth"

const  DefaultUserDashboard1=({user}:{user:AuthenticatedUser})=> {
  const [greeting, setGreeting] = useState("")
const userName =user?.name// This would normally come from your auth system

  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) return "Good morning"
      if (hour < 18) return "Good afternoon"
      return "Good evening"
    }

    setGreeting(getGreeting())
  }, [])

  const quickActions = [
    {
      title: "Add Product",
      icon: PackagePlus,
      href: "/products/new",
      variant: "default" as const,
    },
    {
      title: "New Order",
      icon: ShoppingBag,
      href: "/orders/new",
      variant: "outline" as const,
    },
    {
      title: "View Sales",
      icon: TrendingUp,
      href: "/sales/recent",
      variant: "outline" as const,
    },
    {
      title: "Check Inventory",
      icon: Package,
      href: "/inventory",
      variant: "outline" as const,
    },
    {
      title: "Support",
      icon: HelpCircle,
      href: "/support",
      variant: "outline" as const,
    },
  ]

  const navigationLinks = [
    {
      title: "Products",
      description: "Manage your product inventory",
      icon: Package,
      href: "/products",
    },
    {
      title: "Categories",
      description: "Organize and view product categories",
      icon: ShoppingCart,
      href: "/categories",
    },
    {
      title: "Customers",
      description: "View and manage customer information",
      icon: Users,
      href: "/customers",
    },
    {
      title: "Sales",
      description: "Track your sales performance",
      icon: BarChart3,
      href: "/sales",
    },
    {
      title: "Orders",
      description: "View and process customer orders",
      icon: CreditCard,
      href: "/orders",
    },
    {
      title: "Calendar",
      description: "Schedule and manage events",
      icon: Calendar,
      href: "/calendar",
    },
    {
      title: "Settings",
      description: "Configure your account settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       
      
          <div className="grid gap-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {/* Welcome Card */}
         <div className="grid gap-2 md:gap-4 ">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl md:text-3xl">
                {greeting}, {userName}!
              </CardTitle>
              <CardDescription>Welcome to your dashboard. Here's what you can manage today.</CardDescription>
            </CardHeader>
          </Card>

          </div>
          <div className="grid gap-2 md:gap-4">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 md:flex-nowrap overflow-auto pb-2">
                {quickActions.map((action) => (
                  <Button key={action.title} variant={action.variant} asChild className="h-auto py-2 px-3 md:px-4">
                    <Link href={action.href} className="flex items-center gap-2">
                      <action.icon className="h-4 w-4" />
                      <span>{action.title}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
</div>
          </div>
          {/* Navigation Section */}
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {navigationLinks.map((link) => (
              <Link href={link.href} key={link.title}>
                <Card className="h-full transition-all hover:bg-accent hover:text-accent-foreground">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                    <link.icon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        {/* </div> */}
      </main>
    </div>
  )
}
export default DefaultUserDashboard1
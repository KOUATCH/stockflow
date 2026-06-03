import { PERMISSIONS } from "@/lib/permissions";
import {
  Activity,
  Award,
  BaggageClaim,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  ChefHat,
  CircleDollarSign,
  Clock,
  CreditCard,
  Cpu,
  Crown,
  Database,
  Diamond,
  DollarSign,
  Factory,
  FileText,
  Globe,
  HardDrive,
  Hexagon,
  Layers,
  MapPin,
  Orbit,
  Package,
  Package2,
  Receipt,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Star,
  Target,
  Truck,
  TrendingUp,
  Users,
  Users2,
  UserCheck,
  Wallet,
  Zap,
  Handshake
} from "lucide-react";
import type React from "react";

export const navigationConfig = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Cpu,
    permission: PERMISSIONS.DASHBOARD_READ,
    gradient: "from-teal-600 via-cyan-600 to-blue-700",
    glowColor: "shadow-teal-500/30",
    badge: "Live",
    description: "Real-time inventory overview",
  },
  {
    title: "Inventory Control",
    icon: Package2,
    permission: PERMISSIONS.READ_ITEMS,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    glowColor: "shadow-emerald-500/30",
    badge: "Core",
    description: "Manage all inventory items",
    children: [
      { title: "All Items", href: "/dashboard/inventory/items", permission: PERMISSIONS.READ_ITEMS, icon: Package },
      { title: "Categories", href: "/dashboard/inventory/categories", permission: PERMISSIONS.READ_CATEGORIES, icon: Layers },
      { title: "Brands", href: "/dashboard/inventory/brands", permission: PERMISSIONS.BRANDS_READ, icon: Award },
      { title: "Units", href: "/dashboard/inventory/units", permission: PERMISSIONS.UNITS_READ, icon: Target },
      { title: "Locations", href: "/dashboard/inventory/locations", permission: PERMISSIONS.READ_LOCATIONS, icon: MapPin },
    ],
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    permission: PERMISSIONS.READ_ITEMS,
    gradient: "from-green-600 via-emerald-600 to-teal-700",
    glowColor: "shadow-green-500/30",
    badge: "Core",
    description: "Manage all inventory items",
    children: [
      {
        title: "items",
        href: "/dashboard/inventory/items",
        permission: PERMISSIONS.READ_ITEMS,
        icon: Package,
      }, {
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: PERMISSIONS.READ_CATEGORIES,
        icon: Layers,
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        permission: PERMISSIONS.BRANDS_READ,
        icon: Award,
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        permission: PERMISSIONS.UNITS_READ,
        icon: Target,
      },

      {
        title: "Current Stock",
        href: "/dashboard/inventory/stock",
        permission: PERMISSIONS.STOCK_READ,
        icon: Package,
      },
      {
        title: "Low Stock Items",
        href: "/dashboard/inventory/stock/low-stock",
        permission: PERMISSIONS.STOCK_READ,
        icon: Package,
      },
      {
        title: "Serial Numbers",
        href: "/dashboard/inventory/serial.numbers",
        permission: PERMISSIONS.SERIAL_NUMBERS_READ,
        icon: Package,
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        permission: PERMISSIONS.TRANSFERS_READ,
        icon: Package,
      },
      {
        title: "Create Transfers",
        href: "/dashboard/inventory/transfers.create",
        permission: PERMISSIONS.TRANSFERS_CREATE,
        icon: Package,
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/adjustments",
        permission: PERMISSIONS.ADJUSTMENTS_READ,
        icon: Package,
      },
      {
        title: "Create Adjustments",
        href: "/dashboard/inventory/adjustments/create",
        permission: PERMISSIONS.ADJUSTMENTS_CREATE,
        icon: Package,

      },


    ],
  },
  {
    title: "Production System",
    icon: Factory,
    permission: PERMISSIONS.PRODUCTION_READ,
    gradient: "from-orange-600 via-red-600 to-rose-700",
    glowColor: "shadow-orange-500/30",
    badge: "Bakery",
    description: "Recipe management & production tracking",
    children: [
      {
        title: "Production Dashboard",
        href: "/dashboard/production",
        permission: PERMISSIONS.PRODUCTION_DASHBOARD_READ,
        icon: Factory,
      },
      {
        title: "Recipe Management",
        href: "/dashboard/production/recipes",
        permission: PERMISSIONS.RECIPE_READ,
        icon: ChefHat,
      },
      {
        title: "Production Batches",
        href: "/dashboard/production/batches",
        permission: PERMISSIONS.PRODUCTION_READ,
        icon: Package,
      },
      {
        title: "Production Tracking",
        href: "/dashboard/production/tracking",
        permission: PERMISSIONS.PRODUCTION_TRACKING_READ,
        icon: Activity,
      },
      {
        title: "Raw Materials",
        href: "/dashboard/production/raw-materials",
        permission: PERMISSIONS.RAW_MATERIALS_READ,
        icon: Package2,
      },
      {
        title: "Cost Analysis",
        href: "/dashboard/production/costing",
        permission: PERMISSIONS.PRODUCTION_COSTING_READ,
        icon: DollarSign,
      },
      {
        title: "Profitability Analytics",
        href: "/dashboard/production/profitability",
        permission: PERMISSIONS.PRODUCTION_PROFITABILITY_READ,
        icon: TrendingUp,
      },
      {
        title: "Production Planning",
        href: "/dashboard/production/planning",
        permission: PERMISSIONS.PRODUCTION_PLANNING_READ,
        icon: Target,
      },
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    permission: PERMISSIONS.READ_SALES_ORDERS,
    gradient: "from-rose-600 via-pink-600 to-teal-700",
    glowColor: "shadow-rose-500/30",
    badge: "Core",
    description: "Manage all Sales",
    // dropdown: true,
    children: [
      {
        title: "Sales",
        href: "/dashboard/sales",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: CircleDollarSign,
      },
      {
        title: "Sales Orders",
        href: "/dashboard/session-pos-sync",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: CircleDollarSign,
      },
      {
        title: "Returns",
        href: "/dashboard/returns",
        permission: PERMISSIONS.RETURNS_READ,
        icon: CircleDollarSign,

      },
      {
        title: "Customers",
        href: "/dashboard/customers",
        permission: PERMISSIONS.READ_CUSTOMERS,
        icon: Users,

      },
      {
        title: "POS",
        href: "/dashboard/pos",
        permission: PERMISSIONS.OPERATE_POS,
        icon: CircleDollarSign,

      },
      {
        title: "Daily Sales Analytics",
        href: "/dashboard/sales/financial-analytics",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Client Orders",
    icon: Receipt,
    permission: PERMISSIONS.READ_SALES_ORDERS,
    gradient: "from-indigo-600 via-purple-600 to-pink-700",
    glowColor: "shadow-indigo-500/30",
    badge: "New",
    description: "Advanced order management system",
    children: [
      {
        title: "All Orders",
        href: "/dashboard/orders",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: Receipt,
      },
      {
        title: "Create Order",
        href: "/dashboard/orders/create",
        permission: PERMISSIONS.CREATE_SALES_ORDERS,
        icon: ShoppingCart,
      },
      {
        title: "Order Analytics",
        href: "/dashboard/orders/analytics",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: BarChart3,
      },
      {
        title: "Payments",
        href: "/dashboard/orders/payments",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: CreditCard,
      },
      {
        title: "Deliveries",
        href: "/dashboard/orders/deliveries",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: Truck,
      },
      {
        title: "Order Reports",
        href: "/dashboard/orders/reports",
        permission: PERMISSIONS.READ_SALES_ORDERS,
        icon: FileText,
      },
    ],
  },
  {
    title: "Presence",
    icon: Clock,
    permission: PERMISSIONS.PRESENCE_READ,
    gradient: "from-teal-600 via-cyan-600 to-emerald-700",
    glowColor: "shadow-teal-500/30",
    badge: "Time",
    description: "Employee presence tracking",
    children: [
      {
        title: "Overview",
        href: "/dashboard/presence",
        permission: PERMISSIONS.PRESENCE_READ,
        icon: Clock,
      },
      {
        title: "Clock In/Out",
        href: "/dashboard/presence/clock",
        permission: PERMISSIONS.PRESENCE_CLOCK,
        icon: Clock,
      },
      {
        title: "My Reports",
        href: "/dashboard/presence/reports",
        permission: PERMISSIONS.PRESENCE_REPORTS_READ,
        icon: Clock,
      },
      {
        title: "My Alerts",
        href: "/dashboard/presence/alerts",
        permission: PERMISSIONS.PRESENCE_ALERTS_READ,
        icon: Clock,
      },
      {
        title: "Team Overview",
        href: "/dashboard/presence/team",
        permission: PERMISSIONS.PRESENCE_TEAM_READ,
        icon: Clock,
      },
    ],
  },
  {
    title: "Payroll",
    icon: UserCheck,
    permission: PERMISSIONS.PAYROLL_READ,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
    glowColor: "shadow-emerald-500/30",
    badge: "HR",
    description: "Employee payroll management",
    children: [
      {
        title: "Dashboard",
        href: "/dashboard/payroll",
        permission: PERMISSIONS.PAYROLL_READ,
        icon: UserCheck,
      },
      {
        title: "Monthly Salaries",
        href: "/dashboard/payroll/salary-list",
        permission: PERMISSIONS.PAYROLL_REPORTS_READ,
        icon: DollarSign,
      },
      {
        title: "Employee Management",
        href: "/dashboard/payroll/employees",
        permission: PERMISSIONS.EMPLOYEE_SALARY_READ,
        icon: Users,
      },
      {
        title: "Salary Adjustments",
        href: "/dashboard/payroll/adjustments",
        permission: PERMISSIONS.PAYROLL_READ,
        icon: TrendingUp,
      },
      {
        title: "Salary Details",
        href: "/dashboard/payroll/salary-details",
        permission: PERMISSIONS.PAYROLL_READ,
        icon: FileText,
      },
      {
        title: "Analytics",
        href: "/dashboard/payroll/analytics",
        permission: PERMISSIONS.PAYROLL_ANALYTICS_READ,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    permission: PERMISSIONS.READ_PURCHASE_ORDERS,
    gradient: "from-sky-600 via-blue-600 to-teal-700",
    glowColor: "shadow-sky-500/30",
    badge: "Buy",
    description: "Purchase management",
    children: [
      {
        title: "Purchase Orders",
        href: "/dashboard/purchase-orders",
        permission: PERMISSIONS.READ_PURCHASE_ORDERS,
        icon: ShoppingCart,
      },
      {
        title: "Goods Receipts",
        href: "/dashboard/purchases/goods.receipts",
        permission: PERMISSIONS.RECEIVE_GOODS,
        icon: ShoppingCart,
      },
      {
        title: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        permission: PERMISSIONS.READ_SUPPLIERS,
        icon: Building2,
      },
      {
        title: "Create Supplier",
        href: "/dashboard/purchases/suppliers/create",
        permission: PERMISSIONS.CREATE_SUPPLIERS,
        icon: Building2,
      },
      {
        title: "Supplier Items",
        href: "/dashboard/purchases/supplierItems",
        permission: PERMISSIONS.READ_SUPPLIERS,
        icon: ShoppingCart,
      },
    ],
  },
  {
    title: "Commercial Agents",
    icon: Handshake,
    permission: PERMISSIONS.COMMERCIAL_AGENTS_READ,
    gradient: "from-purple-600 via-violet-600 to-indigo-700",
    glowColor: "shadow-purple-500/30",
    badge: "Sales",
    description: "Agent sales management",
    children: [
      {
        title: "Agents Dashboard",
        href: "/dashboard/commercial-agents",
        permission: PERMISSIONS.COMMERCIAL_AGENTS_READ,
        icon: Handshake,
      },
      {
        title: "Agent Transactions",
        href: "/dashboard/commercial-agents/transactions",
        permission: PERMISSIONS.AGENT_TRANSACTIONS_READ,
        icon: Receipt,
      },
      {
        title: "Settlements",
        href: "/dashboard/commercial-agents/settlements",
        permission: PERMISSIONS.AGENT_SETTLEMENTS_READ,
        icon: DollarSign,
      },
      {
        title: "Agent Performance",
        href: "/dashboard/commercial-agents/performance",
        permission: PERMISSIONS.COMMERCIAL_AGENTS_READ,
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    gradient: "from-slate-600 via-gray-600 to-stone-700",
    glowColor: "shadow-slate-500/30",
    badge: "Config",
    description: "System configuration",
    children: [
      {
        title: "Locations",
        href: "/dashboard/settings/locations",
        permission: PERMISSIONS.READ_LOCATIONS,
        icon: Settings,
      },
      {
        title: "Tax Rates",
        href: "/dashboard/settings/tax-rates",
        permission: PERMISSIONS.TAX_RATES_READ,
        icon: Settings,
      },
      {
        title: "Roles & Permissions",
        href: "/dashboard/settings/roles",
        permission: PERMISSIONS.READ_ROLES,
        icon: Shield,
      },
      {
        title: "Users & Invites",
        href: "/dashboard/settings/users",
        permission: PERMISSIONS.READ_USERS,
        icon: Settings,
      },
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        permission: PERMISSIONS.PROFILE_READ,
        icon: Settings,
      },
      {
        title: "Company Settings",
        href: "/dashboard/settings/company",
        permission: PERMISSIONS.COMPANY_READ,
        icon: Settings,
      },
      {
        title: "Change Password",
        href: "/dashboard/settings/change-password",
        permission: PERMISSIONS.PASSWORD_READ,
        icon: Settings,
      },
      {
        title: "Photo Storage",
        href: "/dashboard/settings/photo-storage",
        permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
        icon: HardDrive,
      },
    ],
  },
  {
    title: "Financial Reporting",
    href: "/dashboard/finance/retail",
    icon: DollarSign,
    permission: PERMISSIONS.VIEW_FINANCIAL_DASHBOARD,
    gradient: "from-yellow-600 via-amber-600 to-orange-700",
    glowColor: "shadow-yellow-500/30",
    badge: "Money",
    description: "Financial analytics",
  },
  {
    title: "Retail Finance",
    icon: TrendingUp,
    permission: PERMISSIONS.DASHBOARD_READ,
    gradient: "from-green-600 via-emerald-600 to-teal-700",
    glowColor: "shadow-green-500/30",
    badge: "Analytics",
    description: "Comprehensive financial management",
    children: [
      {
        title: "Financial Dashboard",
        href: "/dashboard/finance/retail",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: BarChart3
      },
      {
        title: "Sales Analytics",
        href: "/dashboard/finance/sales",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: TrendingUp
      },
      {
        title: "Customer Receivables",
        href: "/dashboard/finance/receivables",
        permission: PERMISSIONS.CUSTOMER_RECEIVABLES_READ,
        icon: Users
      },
      {
        title: "Supplier Payables",
        href: "/dashboard/finance/payables",
        permission: PERMISSIONS.SUPPLIER_PAYABLES_READ,
        icon: ShoppingCart
      },
      {
        title: "Cost Analysis",
        href: "/dashboard/finance/costs",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: DollarSign
      },
      {
        title: "Profit Analysis",
        href: "/dashboard/finance/profitability",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: CircleDollarSign
      },
      {
        title: "Cash Drawer Analytics",
        href: "/dashboard/finance/cash-drawer",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: Wallet
      },
      {
        title: "Comprehensive Analytics",
        href: "/dashboard/finance/analytics",
        permission: PERMISSIONS.DASHBOARD_READ,
        icon: BarChart3
      }
    ]
  },
  {
    title: "Team Universe",
    icon: Users2,
    permission: PERMISSIONS.READ_USERS,
    gradient: "from-teal-600 via-cyan-600 to-blue-700",
    glowColor: "shadow-teal-500/30",
    badge: "Hot",
    description: "Manage your dream team",
    children: [
      { title: "Elite Members", href: "/dashboard/users", permission: PERMISSIONS.READ_USERS, icon: Crown },
      { title: "Power Roles", href: "/dashboard/settings/roles", permission: PERMISSIONS.READ_ROLES, icon: Shield },
      { title: "My Profile", href: "/dashboard/profile", permission: PERMISSIONS.PROFILE_READ, icon: Star }
    ]
  },
  {
    title: "Inventory Galaxy",
    icon: Hexagon,
    permission: PERMISSIONS.READ_ITEMS,
    gradient: "from-lime-600 via-green-600 to-emerald-700",
    glowColor: "shadow-lime-500/30",
    badge: "Pro",
    description: "Your digital warehouse",
    children: [
      { title: "Product Arsenal", href: "/dashboard/inventory/items", permission: PERMISSIONS.READ_ITEMS, icon: Package2 },
      { title: "Category Matrix", href: "/dashboard/inventory/categories", permission: PERMISSIONS.READ_CATEGORIES, icon: Layers },
      { title: "Brand Empire", href: "/dashboard/inventory/brands", permission: PERMISSIONS.BRANDS_READ, icon: Award },
      { title: "Stock Radar", href: "/dashboard/inventory/stock", permission: PERMISSIONS.STOCK_READ, icon: Target },
      { title: "Alert System", href: "/dashboard/inventory/stock/low-stock", permission: PERMISSIONS.STOCK_READ, icon: Bell },
      { title: "Transfer Hub", href: "/dashboard/inventory/transfers", permission: PERMISSIONS.TRANSFERS_READ, icon: Orbit }
    ]
  },
  {
    title: "Revenue Engine",
    icon: Diamond,
    permission: PERMISSIONS.READ_SALES_ORDERS,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    glowColor: "shadow-amber-500/25",
    badge: "$$",
    description: "Money-making machine",
    children: [
      { title: "Sales Command", href: "/dashboard/sales", permission: PERMISSIONS.READ_SALES_ORDERS, icon: TrendingUp },
      { title: "Order Matrix", href: "/dashboard/sales/orders", permission: PERMISSIONS.READ_SALES_ORDERS, icon: FileText },
      { title: "POS Terminal", href: "/dashboard/pos", permission: PERMISSIONS.OPERATE_POS, icon: Zap },
      { title: "Client Base", href: "/dashboard/customers", permission: PERMISSIONS.READ_CUSTOMERS, icon: Users }
    ]
  },
  {
    title: "Supply Chain",
    icon: ShoppingBag,
    permission: PERMISSIONS.READ_PURCHASE_ORDERS,
    gradient: "from-teal-600 via-cyan-600 to-emerald-700",
    glowColor: "shadow-teal-500/30",
    badge: "Elite",
    description: "Procurement powerhouse",
    children: [
      { title: "Purchase Central", href: "/dashboard/purchase-orders", permission: PERMISSIONS.READ_PURCHASE_ORDERS, icon: Briefcase },
      { title: "Vendor Network", href: "/dashboard/purchases/suppliers", permission: PERMISSIONS.READ_SUPPLIERS, icon: Globe },
      { title: "New Vendor", href: "/dashboard/purchases/suppliers/create", permission: PERMISSIONS.CREATE_SUPPLIERS, icon: Building2 },
      { title: "Goods Portal", href: "/dashboard/purchases/goods.receipts", permission: PERMISSIONS.RECEIVE_GOODS, icon: Package }
    ]
  },
  {
    title: "Intelligence Hub",
    icon: Activity,
    permission: PERMISSIONS.VIEW_ANALYTICS,
    gradient: "from-fuchsia-600 via-pink-600 to-rose-700",
    glowColor: "shadow-fuchsia-500/30",
    badge: "AI",
    description: "Data-driven insights",
    children: [
      { title: "Product Intelligence", href: "/dashboard/reports/products", permission: PERMISSIONS.VIEW_ANALYTICS, icon: BarChart3 },
      { title: "Inventory Analytics", href: "/dashboard/reports/inventory", permission: PERMISSIONS.VIEW_ANALYTICS, icon: TrendingUp },
      { title: "Customer Insights", href: "/dashboard/reports/customers", permission: PERMISSIONS.VIEW_ANALYTICS, icon: Target }
    ]
  },
  {
    title: "Content Studio",
    href: "/dashboard/blogs",
    icon: BookOpen,
    permission: PERMISSIONS.BLOGS_READ,
    gradient: "from-red-600 via-rose-600 to-pink-700",
    glowColor: "shadow-red-500/30",
    badge: "Creative",
    description: "Publishing powerhouse"
  },
  {
    title: "Order Universe",
    href: "/dashboard/orders",
    icon: Wallet,
    permission: PERMISSIONS.ORDERS_READ,
    gradient: "from-cyan-600 via-teal-600 to-green-700",
    glowColor: "shadow-cyan-500/30",
    badge: "Live",
    description: "Order management hub"
  },
  {
    title: "Control Center",
    icon: Settings,
    permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    gradient: "from-neutral-600 via-zinc-600 to-gray-700",
    glowColor: "shadow-neutral-500/30",
    badge: "Admin",
    description: "System configuration",
    children: [
      { title: "Location Grid", href: "/dashboard/settings/locations", permission: PERMISSIONS.READ_LOCATIONS, icon: Globe },
      { title: "Tax Engine", href: "/dashboard/settings/tax-rates", permission: PERMISSIONS.TAX_RATES_READ, icon: DollarSign },
      { title: "Roles & Permissions", href: "/dashboard/settings/roles", permission: PERMISSIONS.READ_ROLES, icon: Shield },
      { title: "Company DNA", href: "/dashboard/settings/company", permission: PERMISSIONS.COMPANY_READ, icon: Building2 }
    ]
  }
]

export type NavigationItem = {
  title: string
  href?: string
  icon?: React.ElementType
  permission: string
  gradient?: string
  glowColor?: string
  badge?: string
  description?: string
  children?: NavigationItem[]
}

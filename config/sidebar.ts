// config/sidebar.ts
import { PERMISSIONS } from "@/lib/permissions";
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Book,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  Home,
  LucideIcon,
  Settings,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet
} from "lucide-react";

export interface ISidebarLink {
  title: string;
  href?: string;
  icon: LucideIcon;
  dropdown: boolean;
  permission: string; // Required permission to view this item
  dropdownMenu?: MenuItem[];
}

type MenuItem = {
  title: string;
  href: string;
  permission: string; // Required permission to view this menu item
};

export const sidebarLinks: ISidebarLink[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
    dropdown: false,
    permission: PERMISSIONS.DASHBOARD_READ,
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
    dropdown: true,
    permission: PERMISSIONS.READ_USERS,
    dropdownMenu: [
      {
        title: "Users",
        href: "/dashboard/users",
        permission: PERMISSIONS.READ_USERS,
      },
      {
        title: "Roles",
        href: "/dashboard/settings/roles",
        permission: PERMISSIONS.READ_ROLES,
      },
      {
        title: "Change Password",
        href: "/dashboard/change-password",
        permission: PERMISSIONS.READ_ROLES,
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        permission: PERMISSIONS.READ_ROLES,
      },
    ],
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/items",
    permission: PERMISSIONS.READ_ITEMS,
    dropdownMenu: [
      {
        title: "items",
        href: "/dashboard/inventory/items",
        permission: PERMISSIONS.READ_ITEMS,
      },{
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: PERMISSIONS.READ_CATEGORIES,
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        permission: PERMISSIONS.BRANDS_READ,
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        permission: PERMISSIONS.UNITS_READ,
      },
      
      {
        title: "Current Stock",
        href: "/dashboard/inventory/stock",
        permission: PERMISSIONS.STOCK_READ,
      },
      {
        title: "Low Stock Items",
        href: "/dashboard/inventory/stock/low-stock",
        permission: PERMISSIONS.STOCK_READ,
      },
      {
        title: "Serial Numbers",
        href: "/dashboard/inventory/serial.numbers",
        permission: PERMISSIONS.SERIAL_NUMBERS_READ,
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        permission: PERMISSIONS.TRANSFERS_READ,
      },
      {
        title: "Create Transfers",
        href: "/dashboard/inventory/transfers.create",
        permission: PERMISSIONS.TRANSFERS_CREATE,
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/adjustments",
        permission: PERMISSIONS.ADJUSTMENTS_READ,
      },
      {
        title: "Create Adjustments",
        href: "/dashboard/inventory/adjustments/create",
        permission: PERMISSIONS.ADJUSTMENTS_CREATE,
      },
     
      
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/sales",
    permission: PERMISSIONS.READ_SALES_ORDERS,
    dropdownMenu: [
      {
        title: "Sales",
        href: "/dashboard/sales",
        permission: PERMISSIONS.READ_SALES_ORDERS,
      },
      {
        title: "Sales Orders",
        href: "/dashboard/sales/orders",
        permission: PERMISSIONS.READ_SALES_ORDERS,
      },
      {
        title: "Returns",
        href: "/dashboard/returns",
        permission: PERMISSIONS.RETURNS_READ,
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        permission: PERMISSIONS.READ_CUSTOMERS,
      },
      { 
        title: "POS",
        href: "/dashboard/pos",
        permission: PERMISSIONS.OPERATE_POS,
      },
    ],
  },
  {
    title: "Presence",
    icon: Clock,
    dropdown: true,
    href: "/dashboard/presence",
    permission: PERMISSIONS.PRESENCE_READ,
    dropdownMenu: [
      {
        title: "Overview",
        href: "/dashboard/presence",
        permission: PERMISSIONS.PRESENCE_READ,
      },
      {
        title: "Clock In/Out",
        href: "/dashboard/presence/clock",
        permission: PERMISSIONS.PRESENCE_CLOCK,
      },
      {
        title: "My Reports",
        href: "/dashboard/presence/reports",
        permission: PERMISSIONS.PRESENCE_REPORTS_READ,
      },
      {
        title: "My Alerts",
        href: "/dashboard/presence/alerts",
        permission: PERMISSIONS.PRESENCE_ALERTS_READ,
      },
      {
        title: "Team Overview",
        href: "/dashboard/presence/team",
        permission: PERMISSIONS.PRESENCE_TEAM_READ,
      },
    ],
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    dropdown: true,
    href: "/dashboard/purchase-orders",
    permission: PERMISSIONS.READ_PURCHASE_ORDERS,
    dropdownMenu: [
      {
        title: "Purchase Orders",
        href: "/dashboard/purchase-orders",
        permission: PERMISSIONS.READ_PURCHASE_ORDERS,
      },
      
      {
        title: "Goods Receipts",
        href: "/dashboard/purchases/goods.receipts",
        permission: PERMISSIONS.RECEIVE_GOODS,
      },
      {
        title: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        permission: PERMISSIONS.READ_SUPPLIERS,
      },
      {
        title: "Supplier Items",
        href: "/dashboard/purchases/supplierItems",
        permission: PERMISSIONS.READ_SUPPLIERS,
      },
      
    ],
  },
   {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: true,
    permission: PERMISSIONS.MANAGE_SYSTEM_SETTINGS,
    dropdownMenu: [
      {
        title: "Locations",
        href: "/dashboard/settings/locations",
        permission: PERMISSIONS.READ_LOCATIONS,
      },
      // {
      //   title: "Add Locations",
      //   href: "/dashboard/settings/locations/create",
      //   permission: "locations.create",
      // },
      // {
      //   title: "Add Tax Rates",
      //   href: "/dashboard/settings/tax-rates/create",
      //   permission: "tax.rates.create",
      // },
     
      {
        title: "Tax Rates",
        href: "/dashboard/settings/tax-rates",
        permission: PERMISSIONS.TAX_RATES_READ,
      },
      {
        title: "Roles  & Permissions",
        href: "/dashboard/settings/roles",
        permission: PERMISSIONS.READ_ROLES,
      },
      {
        title: "Users  & Invites",
        href: "/dashboard/settings/users",
        permission: PERMISSIONS.READ_USERS,
      },
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        permission: PERMISSIONS.PROFILE_READ,
      },
      // {
      //   title: "Customers",
      //   href: "/dashboard/settings/customers",
      //   permission: "customers.read",
      // },
      {
        title: "Company Settings",
        href: "/dashboard/settings/company",
        permission: PERMISSIONS.COMPANY_READ,
      },
      { 
        title: "Change Password",
        href: "/dashboard/settings/change-password",
        permission: PERMISSIONS.PASSWORD_READ,
      },
    ],
  },
  
  {
    title: "Blogs",
    icon: Book,
    dropdown: false,
    href: "/dashboard/blogs",
    permission: PERMISSIONS.BLOGS_READ,
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: BarChart2,
    dropdown: false,
    permission: PERMISSIONS.ORDERS_READ,
    
  },
 
  {
    title: "Reports",
    icon: BarChart4,
    dropdown: true,
    href: "/dashboard/reports/products",
    permission: PERMISSIONS.VIEW_ANALYTICS,
    dropdownMenu: [
      {
        title: "Product Report",
        href: "/dashboard/reports/products",
        permission: PERMISSIONS.VIEW_ANALYTICS,
      },
      {
        title: "Inventory Report",
        href: "/dashboard/reports/inventory",
        permission: PERMISSIONS.VIEW_ANALYTICS,
      },
      {
        title: "Customers Report",
        href: "/dashboard/reports/customers",
        permission: PERMISSIONS.VIEW_ANALYTICS,
      },
    ],
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    dropdown: true,
    href: "/dashboard/analytics",
    permission: PERMISSIONS.ANALYTICS_READ,
    dropdownMenu: [
      {
        title: "Dashboard",
        href: "/dashboard/analytics/dashboard",
        permission: PERMISSIONS.ANALYTICS_READ,
      },
      {
        title: "Reports",
        href: "/dashboard/analytics/reports",
        permission: PERMISSIONS.VIEW_ANALYTICS,
      },
    ],
  },
  {
    title: "Financial Reporting",
    icon: DollarSign,
    dropdown: true,
    href: "/dashboard/financial-reporting",
    permission: PERMISSIONS.VIEW_FINANCIAL_DASHBOARD,
    dropdownMenu: [
      {
        title: "Financial Dashboard",
        href: "/dashboard/financial-reporting",
        permission: PERMISSIONS.VIEW_FINANCIAL_DASHBOARD,
      },
      {
        title: "Income Statement",
        href: "/dashboard/financial-reporting/income-statement",
        permission: PERMISSIONS.VIEW_INCOME_STATEMENT,
      },
      {
        title: "Balance Sheet",
        href: "/dashboard/financial-reporting/balance-sheet",
        permission: PERMISSIONS.VIEW_BALANCE_SHEET,
      },
      {
        title: "Cash Flow Statement",
        href: "/dashboard/financial-reporting/cash-flow",
        permission: PERMISSIONS.VIEW_CASH_FLOW_STATEMENT,
      },
      {
        title: "General Ledger",
        href: "/dashboard/financial-reporting/general-ledger",
        permission: PERMISSIONS.VIEW_GENERAL_LEDGER,
      },
      {
        title: "Journal Entries",
        href: "/dashboard/financial-reporting/journal-entries",
        permission: PERMISSIONS.VIEW_JOURNAL_ENTRIES,
      },
      {
        title: "Chart of Accounts",
        href: "/dashboard/financial-reporting/chart-of-accounts",
        permission: PERMISSIONS.VIEW_CHART_OF_ACCOUNTS,
      },
      {
        title: "Financial Analysis",
        href: "/dashboard/financial-reporting/analysis",
        permission: PERMISSIONS.VIEW_FINANCIAL_RATIOS,
      },
      {
        title: "Budget Management",
        href: "/dashboard/financial-reporting/budgets",
        permission: PERMISSIONS.VIEW_BUDGETS,
      },
      {
        title: "Audit & Compliance",
        href: "/dashboard/financial-reporting/audit",
        permission: PERMISSIONS.VIEW_FINANCIAL_AUDIT_TRAIL,
      },
      {
        title: "Period Close",
        href: "/dashboard/financial-reporting/period-close",
        permission: PERMISSIONS.MANAGE_FINANCIAL_PERIODS,
      },
      {
        title: "Cash Management",
        href: "/dashboard/financial-reporting/cash-management",
        permission: PERMISSIONS.VIEW_CASH_MANAGEMENT,
      },
    ],
  },
  {
    title: "Cash Drawer",
    icon: Wallet,
    dropdown: false,
    href: "/dashboard/cashDrawer",
    permission: PERMISSIONS.CASH_DRAWER_READ,
  },
  {
    title: "Cash System",
    icon: CreditCard,
    dropdown: false,
    href: "/dashboard/cashSystem",
    permission: PERMISSIONS.CASH_SYSTEM_READ,
  },
  {
    title: "POS Station",
    icon: CreditCard,
    dropdown: false,
    href: "/dashboard/posStation",
    permission: PERMISSIONS.POS_STATION_READ,
  },
  {
    title: "New POS Session",
    icon: CreditCard,
    dropdown: false,
    href: "/dashboard/newPosSession",
    permission: PERMISSIONS.NEW_POS_SESSION_READ,
  },
  {
    title: "Session POS Sync",
    icon: CreditCard,
    dropdown: false,
    href: "/dashboard/session-pos-sync",
    permission: PERMISSIONS.SESSION_POS_SYNC_READ,
  },
  {
    title: "Purchase Order Workflow",
    icon: ShoppingCart,
    dropdown: false,
    href: "/dashboard/purchaseOrderWorkflow",
    permission: PERMISSIONS.PURCHASE_ORDER_WORKFLOW_READ,
  },
  {
    title: "Recent Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/recentInventory",
    permission: PERMISSIONS.RECENT_INVENTORY_READ,
    dropdownMenu: [
      {
        title: "Overview",
        href: "/dashboard/recentInventory",
        permission: PERMISSIONS.RECENT_INVENTORY_READ,
      },
      {
        title: "Movements",
        href: "/dashboard/recentInventory/movements",
        permission: PERMISSIONS.RECENT_INVENTORY_READ,
      },
      {
        title: "Transfers",
        href: "/dashboard/recentInventory/transfers",
        permission: PERMISSIONS.RECENT_INVENTORY_READ,
      },
    ],
  },
  {
    title: "Admin",
    icon: Settings,
    dropdown: false,
    href: "/dashboard/admin",
    permission: PERMISSIONS.ADMIN_READ,
  },
  {
    title: "Suppliers System",
    icon: ShoppingCart,
    dropdown: false,
    href: "/dashboard/suppliersSystem",
    permission: PERMISSIONS.SUPPLIERS_SYSTEM_READ,
  },
];

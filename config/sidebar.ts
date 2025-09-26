// config/sidebar.ts
import {
  BaggageClaim,
  BarChart2,
  BarChart4,
  Book,
  CircleDollarSign,
  Home,
  LucideIcon,
  Settings,
  ShoppingCart,
  Users
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
    permission: "dashboard.read",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
    dropdown: true,
    permission: "users.read",
    dropdownMenu: [
      {
        title: "Users",
        href: "/dashboard/users",
        permission: "users.read",
      },
      {
        title: "Roles",
        href: "/dashboard/settings/roles",
        permission: "roles.read",
      },
      {
        title: "Change Password",
        href: "/dashboard/change-password",
        permission: "roles.read",
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        permission: "roles.read",
      },
    ],
  },
  {
    title: "Inventory",
    icon: BaggageClaim,
    dropdown: true,
    href: "/dashboard/inventory/items",
    permission: "inventory.read",
    dropdownMenu: [
      {
        title: "items",
        href: "/dashboard/inventory/items",
        permission: "items.read",
      },{
        title: "Categories",
        href: "/dashboard/inventory/categories",
        permission: "categories.read",
      },
      {
        title: "Brands",
        href: "/dashboard/inventory/brands",
        permission: "brands.read",
      },
      {
        title: "Units",
        href: "/dashboard/inventory/units",
        permission: "units.read",
      },
      
      {
        title: "Current Stock",
        href: "/dashboard/inventory/stock",
        permission: "stock.read",
      },
      {
        title: "Low Stock Items",
        href: "/dashboard/inventory/stock/low-stock",
        permission: "stock.read",
      },
      {
        title: "Serial Numbers",
        href: "/dashboard/inventory/serial.numbers",
        permission: "serial.numbers.read",
      },
      {
        title: "Stock Transfers",
        href: "/dashboard/inventory/transfers",
        permission: "transfers.read",
      },
      {
        title: "Create Transfers",
        href: "/dashboard/inventory/transfers.create",
        permission: "transfers.create",
      },
      {
        title: "Stock Adjustments",
        href: "/dashboard/inventory/adjustments",
        permission: "adjustments.read",
      },
      {
        title: "Create Adjustments",
        href: "/dashboard/inventory/adjustments/create",
        permission: "adjustments.create",
      },
     
      
    ],
  },
  {
    title: "Sales",
    icon: CircleDollarSign,
    dropdown: true,
    href: "/dashboard/sales",
    permission: "sales.read",
    dropdownMenu: [
      {
        title: "Sales",
        href: "/dashboard/sales",
        permission: "sales.read",
      },
      {
        title: "Sales Orders",
        href: "/dashboard/sales/orders",
        permission: "sales.orders.read",
      },
      {
        title: "Returns",
        href: "/dashboard/returns",
        permission: "returns.read",
      },
      {
        title: "Customers",
        href: "/dashboard/sales/customers",
        permission: "customers.read",
      },
      { 
        title: "POS",
        href: "/dashboard/pos",
        permission: "pos.read",
      },
    ],
  },
  {
    title: "Purchases",
    icon: ShoppingCart,
    dropdown: true,
    href: "/dashboard/purchaseOrders",
    permission: "purchase.orders.read",
    dropdownMenu: [
      {
        title: "Purchase Orders",
        href: "/dashboard/purchase-orders",
        permission: "purchase.orders.read",
      },
      
      {
        title: "Goods Receipts",
        href: "/dashboard/purchases/goods.receipts",
        permission: "goods.receipts.read",
      },
      {
        title: "Suppliers",
        href: "/dashboard/purchases/suppliers",
        permission: "suppliers.read",
      },
      {
        title: "Supplier Items",
        href: "/dashboard/purchases/supplierItems",
        permission: "suppliers.read",
      },
      
    ],
  },
   {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    dropdown: true,
    permission: "settings.read",
    dropdownMenu: [
      {
        title: "Locations",
        href: "/dashboard/settings/locations",
        permission: "locations.read",
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
        permission: "tax.rates.read",
      },
      {
        title: "Roles  & Permissions",
        href: "/dashboard/settings/roles",
        permission: "roles.read",
      },
      {
        title: "Users  & Invites",
        href: "/dashboard/settings/users",
        permission: "users.read",
      },
      {
        title: "Profile",
        href: "/dashboard/settings/profile",
        permission: "profile.read",
      },
      // {
      //   title: "Customers",
      //   href: "/dashboard/settings/customers",
      //   permission: "customers.read",
      // },
      {
        title: "Company Settings",
        href: "/dashboard/settings/company",
        permission: "company.read",
      },
      { 
        title: "Change Password",
        href: "/dashboard/settings/change-password",
        permission: "password.read",
      },
    ],
  },
  
  {
    title: "Blogs",
    icon: Book,
    dropdown: false,
    href: "/dashboard/blogs",
    permission: "blogs.read",
  },
  {
    title: "Orders",
    href: "/dashboard/orders",
    icon: BarChart2,
    dropdown: false,
    permission: "orders.read",
    
  },
 
  {
    title: "Reports",
    icon: BarChart4,
    dropdown: true,
    href: "/dashboard/reports/products",
    permission: "reports.read",
    dropdownMenu: [
      {
        title: "Product Report",
        href: "/dashboard/reports/products",
        permission: "reports.read",
      },
      {
        title: "Inventory Report",
        href: "/dashboard/reports/inventory",
        permission: "reports.read",
      },
      {
        title: "Customers Report",
        href: "/dashboard/reports/customers",
        permission: "reports.read",
      },
    ],
  },
];

"use client"

// import { navigationConfig, type NavigationItem } from "@/config/navigation-config"
import { Building2, ChevronDown, ChevronRight, Menu, Package, Package2, Search, X } from "lucide-react"
import { type ReactNode, useState } from "react"
import { navigationConfig, NavigationItem } from "./SidebarNavigation"

// Mock session data for demo
const mockSession = {
  user: {
    name: "Sarah Johnson",
    email: "sarah.johnson@inventorytech.com",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b577?w=150&h=150&fit=crop&crop=face",
    organizationName: "InventoryTech Solutions",
    organizationId: "ITS-2024-ENTERPRISE",
    roles: [{ name: "Inventory Manager" }],
    permissions: [
      "dashboard.read",
      "users.read",
      "roles.read",
      "inventory.read",
      "items.read",
      "categories.read",
      "brands.read",
      "units.read",
      "stock.read",
      "sales.read",
      "purchase.orders.read",
      "settings.read",
      "blogs.read",
      "orders.read",
      "reports.read",
      "transfers.read",
      "adjustments.read",
      "suppliers.read",
      "locations.read",
    ],
  },
}

// Mock inventory data
const mockInventoryStats = {
  totalItems: 2847,
  lowStock: 23,
  outOfStock: 7,
  totalValue: 847293,
  pendingOrders: 15,
  recentTransfers: 8,
}

const mockRecentItems = [
  { id: 1, name: "Industrial Bearings", sku: "IB-2024-001", stock: 145, category: "Mechanical", status: "In Stock" },
  { id: 2, name: "Steel Pipes 6inch", sku: "SP-6-2024", stock: 8, category: "Plumbing", status: "Low Stock" },
  { id: 3, name: "Electric Motors 5HP", sku: "EM-5HP-001", stock: 0, category: "Electrical", status: "Out of Stock" },
  { id: 4, name: "Safety Helmets", sku: "SH-PPE-024", stock: 89, category: "Safety", status: "In Stock" },
]

const EnterpriseNavigation = ({ children }: { children: ReactNode }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState(new Set(["Inventory Control", "Stock Management"]))
  const [currentPath, setCurrentPath] = useState("/dashboard")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const hasPermission = (permission: string) => {
    return mockSession.user.permissions.includes(permission)
  }

  const toggleExpanded = (title: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(title)) {
      newExpanded.delete(title)
    } else {
      newExpanded.add(title)
    }
    setExpandedItems(newExpanded)
  }

  const filteredNavigation = navigationConfig.filter((item) => {
    if (!hasPermission(item.permission)) return false
    if (item.children) {
      return item.children.some((child) => hasPermission(child.permission))
    }
    return true
  })

  const NavItem = ({ item, isChild = false }: { item: NavigationItem; isChild?: boolean }) => {
    const Icon = item.icon
    const isExpanded = expandedItems.has(item.title)
    const isActive =
      currentPath === item.href ||
      (item.children && item.children.some((child: NavigationItem) => child.href === currentPath))
    const isHovered = hoveredItem === item.title

    return (
      <div className="group relative">
        <button
          onClick={() => {
            if (item.href) {
              setCurrentPath(item.href)
              setIsMobileOpen(false)
            } else if (item.children) {
              toggleExpanded(item.title)
            }
          }}
          onMouseEnter={() => setHoveredItem(item.title)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden
            ${isActive && !isChild
              ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl ${item.glowColor} transform scale-[1.02]`
              : isActive && isChild
                ? "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50 shadow-md"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:text-gray-900 hover:shadow-lg hover:border hover:border-gray-200/50"
            }
            ${isChild ? "ml-8 py-2.5" : ""}
            ${isCollapsed && !isChild ? "justify-center" : ""}
          `}
        >
          {(isActive || isHovered) && !isChild && (
            <div
              className={`
              absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-10 rounded-2xl
              transition-opacity duration-300
            `}
            />
          )}

          {Icon && (
            <div
              className={`
              flex-shrink-0 transition-all duration-300 relative z-10
              ${isActive ? "scale-110 drop-shadow-lg" : isHovered ? "scale-105" : ""}
              ${isCollapsed && !isChild ? "scale-125" : ""}
            `}
            >
              <div
                className={`
                relative p-2 rounded-xl transition-all duration-300
                ${isActive && !isChild
                    ? "bg-white/20 backdrop-blur-sm"
                    : isHovered && !isChild
                      ? `bg-gradient-to-r ${item.gradient} bg-opacity-10`
                      : ""
                  }
              `}
              >
                <Icon size={isChild ? 18 : 22} />
                {isActive && !isChild && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm animate-pulse" />
                )}
              </div>
            </div>
          )}

          <div
            className={`
            flex-1 transition-all duration-300 relative z-10 min-w-0
            ${isCollapsed && !isChild ? "opacity-0 w-0 overflow-hidden" : "opacity-100"}
          `}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span
                  className={`
                  font-semibold transition-all duration-200 block truncate
                  ${isChild ? "text-sm" : "text-base"}
                `}
                >
                  {item.title}
                </span>
                {!isChild && !isCollapsed && item.description && (
                  <span
                    className={`
                    text-xs opacity-75 block truncate transition-all duration-200
                    ${isActive ? "text-white/80" : "text-gray-500"}
                  `}
                  >
                    {item.description}
                  </span>
                )}
              </div>

              {item.badge && !isChild && !isCollapsed && (
                <span
                  className={`
                  px-2 py-0.5 text-xs font-bold rounded-full transition-all duration-200
                  ${isActive
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700"
                    }
                `}
                >
                  {item.badge}
                </span>
              )}

              {item.children && !isCollapsed && (
                <div
                  className={`
                  ml-2 transition-all duration-300 relative z-10
                  ${isExpanded ? "rotate-180" : "rotate-0"}
                `}
                >
                  <ChevronDown size={16} />
                </div>
              )}
            </div>
          </div>

          {isCollapsed && !isChild && isHovered && (
            <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap z-50">
              <div className="font-medium">{item.title}</div>
              {item.description && <div className="text-xs opacity-75">{item.description}</div>}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
            </div>
          )}
        </button>

        {item.children && !isCollapsed && (
          <div
            className={`
            overflow-hidden transition-all duration-500 ease-out
            ${isExpanded ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"}
          `}
          >
            <div className="space-y-1">
              {item.children
                .filter((child: { permission: string }) => hasPermission(child.permission))
                .map((child: any, index: number) => (
                  <div
                    key={child.title}
                    className={`
                      transition-all duration-300
                      ${isExpanded ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}
                    `}
                    style={{ transitionDelay: isExpanded ? `${index * 50}ms` : "0ms" }}
                  >
                    <NavItem item={child} isChild />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Desktop Sidebar */}
      <div
        className={`
        hidden md:flex flex-col bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl transition-all duration-500
        ${isCollapsed ? "w-24" : "w-80"}
      `}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-100/50">
          <div className={`flex items-center transition-all duration-300 ${isCollapsed ? "justify-center" : "gap-4"}`}>
            <div className="relative">
              <div
                className={`
                w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl 
                flex items-center justify-center shadow-xl shadow-emerald-500/25 transition-all duration-300
                ${isCollapsed ? "scale-110" : "scale-100"}
              `}
              >
                <Package2 className="w-7 h-7 text-white drop-shadow-sm" />
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
              ${isCollapsed ? "-right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0" : ""}
            `}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Organization Info */}
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
                <p className="font-bold text-gray-900 truncate text-lg">{mockSession.user.organizationName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                    <Package className="w-3 h-3 mr-1" />
                    {mockSession.user.roles[0].name}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          <div
            className={`
            text-xs font-bold text-gray-400 uppercase tracking-wider transition-all duration-300
            ${isCollapsed ? "opacity-0 h-0" : "opacity-100 h-auto mb-4"}
          `}
          >
            Inventory Management
          </div>
          {filteredNavigation.map((item, index) => (
            <div
              key={item.title}
              className="animate-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <NavItem item={item} />
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
          <div
            className={`
            flex items-center gap-3 p-4 rounded-2xl bg-white shadow-lg border border-gray-200/50
            hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer
            ${isCollapsed ? "justify-center" : ""}
          `}
          >
            <div className="relative">
              <img
                src={mockSession.user.image || "/placeholder.svg"}
                alt={mockSession.user.name}
                className="w-10 h-10 rounded-2xl object-cover shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{mockSession.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{mockSession.user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`
        fixed left-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl z-50 shadow-2xl
        transform transition-all duration-500 md:hidden
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Package2 className="w-6 h-6 text-white" />
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
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
            >
              <NavItem item={item} />
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search inventory items..."
                  className="pl-12 pr-6 py-3 w-80 rounded-2xl border border-gray-200/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-lg hover:shadow-xl transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">{/* Quick Actions */}</div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Custom children content */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default EnterpriseNavigation

# Navigation Components

This directory contains professional, enterprise-quality navigation components designed to match the existing sidebar design and enhance the user experience.

## Components

### 1. TopNavigation.tsx
A clean, professional top navigation bar with:
- Global search functionality
- Quick actions menu
- System status indicators
- Organization information
- Help menu integration
- Notification system integration

### 2. EnhancedTopNavigation.tsx
An advanced version with additional enterprise features:
- Command palette with keyboard shortcuts (⌘K)
- Advanced search with categories and recent activity
- Business metrics display
- Favorite actions system
- Enhanced quick actions with categorization
- Real-time business metrics
- Recent activity tracking

## Features

### 🔍 Global Search & Command Palette
- Intelligent search across products, orders, customers
- Keyboard shortcuts (Ctrl/Cmd + K)
- Quick access to actions and navigation
- Recent activity integration

### 📊 Business Metrics
- Real-time sales data
- Order count tracking
- Low stock alerts
- System status monitoring

### ⚡ Quick Actions
- Contextual quick actions for common tasks
- Categorized action groupings
- Favorites system
- One-click access to critical functions

### 🏢 Organization Context
- Organization name and role display
- System status indicators
- Real-time connectivity status

### 🔔 Integrated Notifications
- Seamless integration with existing NotificationProvider
- Real-time notification counts
- Quick notification access

## Usage

### Basic Integration (Existing Layout)

Replace the existing Navbar component in your layout:

```tsx
// In your layout file (e.g., DashboardLayout.tsx)
import TopNavigation from "@/components/navigation/TopNavigation";

// Replace existing <Navbar session={session} /> with:
<TopNavigation
  session={session}
  notifications={notifications}
  onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
  showMobileMenu={true}
/>
```

### Enhanced Integration (Advanced Features)

For the full-featured version:

```tsx
import EnhancedTopNavigation from "@/components/navigation/EnhancedTopNavigation";

<EnhancedTopNavigation
  session={session}
  notifications={notifications}
  onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
  showMobileMenu={true}
  className="custom-nav-class" // optional
/>
```

### Standalone Usage (Without Sidebar)

```tsx
<TopNavigation
  session={session}
  notifications={notifications}
  showMobileMenu={false} // Hides mobile menu button and shows logo
/>
```

## Integration Examples

### 1. With Existing DashboardLayout

```tsx
// app/(dashboard)/layout.tsx
import { Session } from "next-auth";
import EnhancedTopNavigation from "@/components/navigation/EnhancedTopNavigation";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
  session
}: {
  children: React.ReactNode;
  session: Session;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar session={session} />

      {/* Main Content Area */}
      <div className="pl-[220px] lg:pl-[280px]">
        {/* Enhanced Top Navigation */}
        <EnhancedTopNavigation
          session={session}
          notifications={notifications}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 2. Replacing Existing Navbar

```tsx
// Replace in existing layout files
// OLD:
// <Navbar session={session} />

// NEW:
<EnhancedTopNavigation session={session} notifications={notifications} />
```

## Customization

### Theme Integration
Both components automatically inherit your existing theme via:
- Tailwind CSS classes
- CN utility function
- Existing component library (ui components)

### Adding Custom Actions
Edit the `quickActions` array in either component:

```tsx
const quickActions = [
  {
    id: "custom-action",
    title: "Custom Action",
    description: "Your custom description",
    href: "/your/custom/path",
    icon: YourIcon,
    color: "bg-custom-color",
    category: "Custom",
    keywords: ["custom", "action", "keywords"],
  },
  // ... existing actions
];
```

### Metrics Customization
Update the business metrics in `EnhancedTopNavigation`:

```tsx
const [metrics] = useState({
  todaySales: await getSalesData(),
  todayOrders: await getOrdersData(),
  lowStock: await getLowStockCount(),
  pendingOrders: await getPendingOrdersCount(),
});
```

## Dependencies

These components use existing project dependencies:
- Lucide React (icons)
- Radix UI components (via your ui folder)
- Next.js navigation hooks
- Existing NotificationProvider
- Session management from NextAuth

## Keyboard Shortcuts

### Enhanced Navigation
- `Ctrl/Cmd + K` - Open command palette
- `Escape` - Close command palette
- `↑↓` - Navigate search results
- `Enter` - Select result

## Responsive Design

Both components are fully responsive:
- **Desktop**: Full feature set with all menus and metrics
- **Tablet**: Condensed view with essential features
- **Mobile**: Collapsed view with essential actions only

## Performance Considerations

- Lazy loading of menu content
- Optimized search with debouncing
- Efficient re-rendering with React.memo usage
- Minimal bundle size impact

## Migration Guide

1. **Phase 1**: Replace existing Navbar with TopNavigation
2. **Phase 2**: Upgrade to EnhancedTopNavigation for advanced features
3. **Phase 3**: Customize actions and metrics for your specific needs

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile Safari 14+
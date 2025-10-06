// Navigation Components Export
export { default as TopNavigation } from './TopNavigation';
export { default as EnhancedTopNavigation } from './EnhancedTopNavigation';
export { default as NavigationWrapper, useNavigationPreferences } from './NavigationWrapper';

// Re-export types for convenience

// Navigation configuration types
export interface NavigationConfig {
  variant: 'basic' | 'enhanced';
  showMetrics: boolean;
  showQuickActions: boolean;
  enableCommandPalette: boolean;
  enableKeyboardShortcuts: boolean;
}

// Default navigation configuration
export const defaultNavigationConfig: NavigationConfig = {
  variant: 'enhanced',
  showMetrics: true,
  showQuickActions: true,
  enableCommandPalette: true,
  enableKeyboardShortcuts: true,
};

// Quick Actions type for external customization
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  category: string;
  keywords: string[];
}

// Business Metrics type for external integration
export interface BusinessMetrics {
  todaySales: number;
  todayOrders: number;
  lowStock: number;
  pendingOrders: number;
}
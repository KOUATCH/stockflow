"use client";

import { useState } from "react";
import EnhancedTopNavigation from "./EnhancedTopNavigation";
import TopNavigation from "./TopNavigation";

interface NavigationWrapperProps {
  session: any;
  notifications?: any[];
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
  variant?: "basic" | "enhanced";
  className?: string;
}

/**
 * NavigationWrapper component provides a unified interface for both
 * basic and enhanced navigation components. This wrapper allows for
 * easy switching between navigation variants and future extensibility.
 */
export default function NavigationWrapper({
  session,
  notifications = [],
  onMenuToggle,
  showMobileMenu = true,
  variant = "enhanced",
  className,
}: NavigationWrapperProps) {
  // You can add logic here to determine which variant to use
  // based on user preferences, feature flags, or subscription level
  const useEnhancedNavigation = variant === "enhanced";

  if (useEnhancedNavigation) {
    return (
      <EnhancedTopNavigation
        session={session}
        notifications={notifications}
        onMenuToggle={onMenuToggle}
        showMobileMenu={showMobileMenu}
        className={className}
      />
    );
  }

  return (
    <TopNavigation
      session={session}
      notifications={notifications}
      onMenuToggle={onMenuToggle}
      showMobileMenu={showMobileMenu}
    />
  );
}

/**
 * Hook for managing navigation preferences
 */
export function useNavigationPreferences() {
  const [variant, setVariant] = useState<"basic" | "enhanced">("enhanced");
  const [showMetrics, setShowMetrics] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const toggleVariant = () => {
    setVariant(prev => prev === "basic" ? "enhanced" : "basic");
  };

  return {
    variant,
    setVariant,
    showMetrics,
    setShowMetrics,
    showQuickActions,
    setShowQuickActions,
    toggleVariant,
  };
}
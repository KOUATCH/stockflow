"use client";

// =============================================================================
// ROLE-BASED FINANCIAL DASHBOARD
// Adaptive dashboard that shows different views based on user roles and permissions
// =============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, AlertTriangle, Eye, Settings, TrendingUp, FileText } from 'lucide-react';

// Import existing dashboard components
import { ModernFinancialDashboard } from './modern-financial-dashboard';

// Import auth and permissions
import { useAuth } from '@/hooks/useAuth';
import { FINANCIAL_PERMISSIONS, FINANCIAL_ROLE_TEMPLATES, type FinancialPermission } from '@/lib/permissions/financial-permissions';
import { checkFinancialPermission } from '@/lib/financial-reporting/auth/financial-access-control';
import { logFinancialActivity } from '@/lib/financial-reporting/auth/authenticated-audit-service';
import { useFinancialNotifications } from '@/lib/financial-reporting/notifications/financial-notification-service';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface UserFinancialProfile {
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: FinancialPermission[];
  accessLevel: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXECUTIVE' | 'ADMIN';
  restrictions: string[];
}

interface DashboardTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiredPermissions: FinancialPermission[];
  requiredRole?: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  component: React.ComponentType<any>;
}

interface RoleBasedViewConfig {
  availableTabs: DashboardTab[];
  defaultTab: string;
  restrictedFeatures: string[];
  additionalControls: React.ComponentType<any>[];
}

// =============================================================================
// DASHBOARD TAB COMPONENTS
// =============================================================================

const ExecutiveSummaryView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Health Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">92/100</div>
          <p className="text-xs text-muted-foreground">+2.5 from last quarter</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">Compliant</div>
          <p className="text-xs text-muted-foreground">All controls tested</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">Medium</div>
          <p className="text-xs text-muted-foreground">2 items need attention</p>
        </CardContent>
      </Card>
    </div>

    <ModernFinancialDashboard
      organizationId={organizationId}
      restrictedMode={true}
      executiveView={true}
    />
  </div>
);

const FinancialAnalysisView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <ModernFinancialDashboard
      organizationId={organizationId}
      focusMode="analysis"
      showAdvancedAnalytics={true}
    />
  </div>
);

const ComplianceView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <Alert>
      <Shield className="h-4 w-4" />
      <AlertDescription>
        This view provides compliance monitoring and audit trail information.
      </AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>Compliance Dashboard</CardTitle>
        <CardDescription>Monitor regulatory compliance and internal controls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold">SOX Compliance</h4>
            <Badge variant="outline" className="text-green-600">Compliant</Badge>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">GAAP Compliance</h4>
            <Badge variant="outline" className="text-green-600">Compliant</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const OperationalView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <Alert>
      <Eye className="h-4 w-4" />
      <AlertDescription>
        Operational view with limited access to financial data entry and basic reporting.
      </AlertDescription>
    </Alert>

    <ModernFinancialDashboard
      organizationId={organizationId}
      restrictedMode={true}
      operationalView={true}
    />
  </div>
);

const AuditView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <Alert>
      <FileText className="h-4 w-4" />
      <AlertDescription>
        Audit view provides comprehensive access to audit trails and investigation tools.
      </AlertDescription>
    </Alert>

    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>Complete audit trail and investigation dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Audit trail component would be rendered here with full investigation capabilities.
        </p>
      </CardContent>
    </Card>
  </div>
);

const AdminView: React.FC<{ organizationId: string }> = ({ organizationId }) => (
  <div className="space-y-6">
    <Alert>
      <Settings className="h-4 w-4" />
      <AlertDescription>
        Administrative view with full system configuration and management capabilities.
      </AlertDescription>
    </Alert>

    <ModernFinancialDashboard
      organizationId={organizationId}
      adminMode={true}
      showAllFeatures={true}
    />
  </div>
);

// =============================================================================
// DASHBOARD TAB DEFINITIONS
// =============================================================================

const DASHBOARD_TABS: DashboardTab[] = [
  {
    id: 'executive',
    label: 'Executive Summary',
    icon: <TrendingUp className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_COMPREHENSIVE_FINANCIAL_REPORTS],
    riskLevel: 'LOW',
    component: ExecutiveSummaryView
  },
  {
    id: 'analysis',
    label: 'Financial Analysis',
    icon: <TrendingUp className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_RATIOS, FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_TRENDS],
    riskLevel: 'MEDIUM',
    component: FinancialAnalysisView
  },
  {
    id: 'statements',
    label: 'Financial Statements',
    icon: <FileText className="h-4 w-4" />,
    requiredPermissions: [
      FINANCIAL_PERMISSIONS.VIEW_INCOME_STATEMENT,
      FINANCIAL_PERMISSIONS.VIEW_BALANCE_SHEET,
      FINANCIAL_PERMISSIONS.VIEW_CASH_FLOW_STATEMENT
    ],
    riskLevel: 'HIGH',
    component: FinancialAnalysisView
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: <Shield className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_COMPLIANCE_STATUS],
    riskLevel: 'HIGH',
    component: ComplianceView
  },
  {
    id: 'audit',
    label: 'Audit Trail',
    icon: <FileText className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_FINANCIAL_AUDIT_TRAIL],
    riskLevel: 'CRITICAL',
    component: AuditView
  },
  {
    id: 'operational',
    label: 'Operations',
    icon: <Eye className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.VIEW_JOURNAL_ENTRIES],
    riskLevel: 'MEDIUM',
    component: OperationalView
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: <Settings className="h-4 w-4" />,
    requiredPermissions: [FINANCIAL_PERMISSIONS.CONFIGURE_FINANCIAL_SYSTEM],
    requiredRole: 'cfo',
    riskLevel: 'CRITICAL',
    component: AdminView
  }
];

// =============================================================================
// ROLE-BASED VIEW CONFIGURATIONS
// =============================================================================

const ROLE_CONFIGURATIONS: Record<string, RoleBasedViewConfig> = {
  'cfo': {
    availableTabs: DASHBOARD_TABS,
    defaultTab: 'executive',
    restrictedFeatures: [],
    additionalControls: []
  },
  'ceo': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      ['executive', 'analysis', 'statements', 'compliance'].includes(tab.id)
    ),
    defaultTab: 'executive',
    restrictedFeatures: ['data_export', 'system_config'],
    additionalControls: []
  },
  'controller': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      !['admin'].includes(tab.id)
    ),
    defaultTab: 'statements',
    restrictedFeatures: ['system_config'],
    additionalControls: []
  },
  'financial_analyst': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      ['executive', 'analysis', 'statements'].includes(tab.id)
    ),
    defaultTab: 'analysis',
    restrictedFeatures: ['data_export', 'compliance_mgmt', 'system_config'],
    additionalControls: []
  },
  'internal_auditor': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      ['executive', 'statements', 'compliance', 'audit'].includes(tab.id)
    ),
    defaultTab: 'audit',
    restrictedFeatures: ['data_modification', 'system_config'],
    additionalControls: []
  },
  'accounting_clerk': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      ['operational'].includes(tab.id)
    ),
    defaultTab: 'operational',
    restrictedFeatures: ['executive_views', 'compliance_mgmt', 'audit_trail', 'system_config'],
    additionalControls: []
  },
  'financial_viewer': {
    availableTabs: DASHBOARD_TABS.filter(tab =>
      ['executive', 'statements'].includes(tab.id) && tab.riskLevel !== 'CRITICAL'
    ),
    defaultTab: 'executive',
    restrictedFeatures: ['data_export', 'data_modification', 'compliance_mgmt', 'audit_trail', 'system_config'],
    additionalControls: []
  }
};

// =============================================================================
// MAIN ROLE-BASED DASHBOARD COMPONENT
// =============================================================================

interface RoleBasedFinancialDashboardProps {
  organizationId: string;
  initialData?: any;
}

export const RoleBasedFinancialDashboard: React.FC<RoleBasedFinancialDashboardProps> = ({
  organizationId,
  initialData
}) => {
  const { user, isLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserFinancialProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');
  const [permissionChecks, setPermissionChecks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Financial notifications
  const notifications = useFinancialNotifications();

  // Load user financial profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get user permissions
        const permissions: FinancialPermission[] = [];
        for (const permission of Object.values(FINANCIAL_PERMISSIONS)) {
          try {
            const hasPermission = await checkFinancialPermission(
              user.id,
              organizationId,
              permission
            );
            if (hasPermission) {
              permissions.push(permission);
            }
          } catch (error) {
            console.warn(`Failed to check permission ${permission}:`, error);
          }
        }

        // Determine access level
        const accessLevel = determineAccessLevel(user.roles, permissions);

        const profile: UserFinancialProfile = {
          userId: user.id,
          organizationId,
          roles: user.roles || [],
          permissions,
          accessLevel,
          restrictions: []
        };

        setUserProfile(profile);

        // Log dashboard access
        await logFinancialActivity(
          'ACCESS_FINANCIAL_DASHBOARD',
          'FINANCIAL_DASHBOARD',
          `User accessed role-based financial dashboard with ${accessLevel} access level`
        );

        // Notify successful access
        notifications.info(
          'Dashboard Access',
          `Financial dashboard loaded with ${accessLevel} access level`,
          { sound: false, duration: 2000 }
        );

      } catch (error) {
        console.error('Failed to load user profile:', error);
        setError('Failed to load user profile');

        // Notify error
        notifications.error(
          'Dashboard Error',
          'Failed to load user profile. Please refresh and try again.',
          { sound: true, duration: 5000 }
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user, organizationId]);

  // Get role-based configuration
  const roleConfig = useMemo(() => {
    if (!userProfile || !userProfile.roles.length) {
      return ROLE_CONFIGURATIONS['financial_viewer'];
    }

    // Find the highest privilege role
    const priorityRoles = ['cfo', 'ceo', 'controller', 'internal_auditor', 'financial_analyst', 'accounting_clerk'];
    const userRole = priorityRoles.find(role => userProfile.roles.includes(role)) || 'financial_viewer';

    return ROLE_CONFIGURATIONS[userRole];
  }, [userProfile]);

  // Filter available tabs based on permissions
  const availableTabs = useMemo(() => {
    if (!userProfile) return [];

    return roleConfig.availableTabs.filter(tab => {
      // Check if user has required permissions
      const hasRequiredPermissions = tab.requiredPermissions.every(permission =>
        userProfile.permissions.includes(permission)
      );

      // Check if user has required role (if specified)
      const hasRequiredRole = !tab.requiredRole || userProfile.roles.includes(tab.requiredRole);

      return hasRequiredPermissions && hasRequiredRole;
    });
  }, [userProfile, roleConfig]);

  // Set default active tab
  useEffect(() => {
    if (availableTabs.length > 0 && !activeTab) {
      const defaultTab = availableTabs.find(tab => tab.id === roleConfig.defaultTab);
      setActiveTab(defaultTab?.id || availableTabs[0].id);
    }
  }, [availableTabs, roleConfig.defaultTab, activeTab]);

  // Determine access level based on roles and permissions
  const determineAccessLevel = (roles: string[], permissions: FinancialPermission[]): UserFinancialProfile['accessLevel'] => {
    if (roles.includes('cfo') || roles.includes('ceo')) return 'EXECUTIVE';
    if (roles.includes('controller') || roles.includes('internal_auditor')) return 'ADMIN';
    if (roles.includes('financial_analyst') || roles.includes('compliance_officer')) return 'ADVANCED';
    if (roles.includes('accounting_clerk') || permissions.length > 10) return 'INTERMEDIATE';
    return 'BASIC';
  };

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading financial dashboard...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // No access
  if (!userProfile || availableTabs.length === 0) {
    return (
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          You don't have permission to access the financial dashboard. Please contact your administrator.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Access Level Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold">Financial Dashboard</h1>
          <Badge variant="outline" className="text-xs">
            {userProfile.accessLevel} Access
          </Badge>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>{userProfile.permissions.length} permissions</span>
        </div>
      </div>

      {/* Role-based tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-auto">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              {tab.icon}
              <span>{tab.label}</span>
              {tab.riskLevel === 'CRITICAL' && (
                <Badge variant="destructive" className="text-xs ml-1">High Risk</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {availableTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="mt-6">
            <tab.component organizationId={organizationId} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Restrictions notice */}
      {roleConfig.restrictedFeatures.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some features are restricted based on your role: {roleConfig.restrictedFeatures.join(', ')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RoleBasedFinancialDashboard;
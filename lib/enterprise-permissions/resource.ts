/**
 * Resource Access Manager
 *
 * Handles resource-level permissions and ownership-based access control.
 * Provides fine-grained access control for specific resources within the system.
 */

import { PrismaClient } from '@prisma/client';
import type {
  EnhancedUser,
  PermissionContext,
  PermissionResult,
  ResourcePermission,
  PermissionConfig,
} from './types';
import { SYSTEM_PERMISSIONS } from './permissions';

export class ResourceAccessManager {
  private prisma: PrismaClient;
  private config: PermissionConfig;

  constructor(prisma: PrismaClient, config: PermissionConfig) {
    this.prisma = prisma;
    this.config = config;
  }

  /**
   * Check if user can access a specific resource
   */
  async canAccessResource(
    user: EnhancedUser,
    resourceType: string,
    resourceId: string,
    action: string,
    context: PermissionContext = {}
  ): Promise<PermissionResult> {
    try {
      // Build resource permission string
      const resourcePermission = `${action.toUpperCase()}_${resourceType.toUpperCase()}`;

      // Check if user has general permission for this resource type
      const hasGeneralPermission = await this.hasGeneralResourcePermission(user, resourcePermission);

      // Get or create resource record
      const resource = await this.getOrCreateResource(resourceType, resourceId, user.organizationId);

      // Check specific resource permissions
      const hasSpecificPermission = await this.hasSpecificResourcePermission(
        user,
        resource.id,
        action
      );

      // Check ownership
      const isOwner = resource.ownerId === user.id;

      // Evaluate access based on business rules
      const accessResult = this.evaluateResourceAccess({
        user,
        resourceType,
        resourceId,
        action,
        hasGeneralPermission,
        hasSpecificPermission,
        isOwner,
        resource,
        context,
      });

      return accessResult;
    } catch (error) {
      return {
        granted: false,
        reason: `Resource access check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        auditInfo: {
          logRequired: true,
          metadata: { error: error instanceof Error ? error.message : error },
        },
      };
    }
  }

  /**
   * Grant resource-specific permission to a user
   */
  async grantResourcePermission(
    resourceType: string,
    resourceId: string,
    userId: string,
    permissionType: string,
    grantedBy: string,
    options: {
      expiresAt?: Date;
      conditions?: any;
    } = {}
  ): Promise<boolean> {
    try {
      // Get or create resource
      const granter = await this.getUserWithPermissions(grantedBy);
      if (!granter) {
        throw new Error('Granter user not found');
      }

      const resource = await this.getOrCreateResource(resourceType, resourceId, granter.organizationId);

      // Check if granter has permission to grant access
      const canGrant = await this.canGrantResourcePermission(granter, resource, permissionType);
      if (!canGrant) {
        throw new Error('Insufficient permissions to grant resource access');
      }

      // Create resource permission
      await this.prisma.resourcePermission.create({
        data: {
          resourceId: resource.id,
          userId,
          permissionType,
          grantedBy,
          expiresAt: options.expiresAt,
          conditions: options.conditions,
        },
      });

      return true;
    } catch (error) {
      console.error('Error granting resource permission:', error);
      return false;
    }
  }

  /**
   * Revoke resource-specific permission from a user
   */
  async revokeResourcePermission(
    resourceType: string,
    resourceId: string,
    userId: string,
    permissionType: string,
    revokedBy: string
  ): Promise<boolean> {
    try {
      const revoker = await this.getUserWithPermissions(revokedBy);
      if (!revoker) {
        throw new Error('Revoker user not found');
      }

      const resource = await this.prisma.resource.findFirst({
        where: {
          resourceType,
          resourceId,
          organizationId: revoker.organizationId,
        },
      });

      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check if revoker has permission to revoke access
      const canRevoke = await this.canRevokeResourcePermission(revoker, resource, permissionType);
      if (!canRevoke) {
        throw new Error('Insufficient permissions to revoke resource access');
      }

      // Remove resource permission
      await this.prisma.resourcePermission.deleteMany({
        where: {
          resourceId: resource.id,
          userId,
          permissionType,
        },
      });

      return true;
    } catch (error) {
      console.error('Error revoking resource permission:', error);
      return false;
    }
  }

  /**
   * Get all resources a user has access to
   */
  async getUserAccessibleResources(
    userId: string,
    resourceType?: string,
    action?: string
  ): Promise<ResourcePermission[]> {
    try {
      const user = await this.getUserWithPermissions(userId);
      if (!user) {
        return [];
      }

      const whereClause: any = {
        resource: {
          organizationId: user.organizationId,
        },
      };

      if (resourceType) {
        whereClause.resource.resourceType = resourceType;
      }

      if (action) {
        whereClause.permissionType = action;
      }

      // Get direct resource permissions
      const directPermissions = await this.prisma.resourcePermission.findMany({
        where: {
          ...whereClause,
          userId,
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          resource: true,
        },
      });

      // Get role-based resource permissions
      const rolePermissions = await this.prisma.resourcePermission.findMany({
        where: {
          ...whereClause,
          roleId: {
            in: user.roles.map(r => r.id),
          },
          expiresAt: {
            gte: new Date(),
          },
        },
        include: {
          resource: true,
        },
      });

      // Get owned resources
      const ownedResources = await this.prisma.resource.findMany({
        where: {
          ownerId: userId,
          organizationId: user.organizationId,
          ...(resourceType && { resourceType }),
        },
      });

      // Combine and format results
      const allPermissions: ResourcePermission[] = [];

      // Add direct permissions
      directPermissions.forEach(p => {
        allPermissions.push({
          resourceType: p.resource.resourceType,
          resourceId: p.resource.resourceId,
          permissionType: p.permissionType as any,
          grantType: 'DIRECT',
          expiresAt: p.expiresAt || undefined,
          metadata: p.conditions,
        });
      });

      // Add role-based permissions
      rolePermissions.forEach(p => {
        allPermissions.push({
          resourceType: p.resource.resourceType,
          resourceId: p.resource.resourceId,
          permissionType: p.permissionType as any,
          grantType: 'ROLE_BASED',
          expiresAt: p.expiresAt || undefined,
          metadata: p.conditions,
        });
      });

      // Add owned resources
      ownedResources.forEach(r => {
        allPermissions.push({
          resourceType: r.resourceType,
          resourceId: r.resourceId,
          permissionType: 'ADMIN',
          grantType: 'INHERITED',
          metadata: { ownership: true },
        });
      });

      return allPermissions;
    } catch (error) {
      console.error('Error getting user accessible resources:', error);
      return [];
    }
  }

  /**
   * Transfer resource ownership
   */
  async transferResourceOwnership(
    resourceType: string,
    resourceId: string,
    newOwnerId: string,
    transferredBy: string
  ): Promise<boolean> {
    try {
      const transferrer = await this.getUserWithPermissions(transferredBy);
      if (!transferrer) {
        throw new Error('Transferrer user not found');
      }

      const resource = await this.prisma.resource.findFirst({
        where: {
          resourceType,
          resourceId,
          organizationId: transferrer.organizationId,
        },
      });

      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check if user can transfer ownership
      const canTransfer = resource.ownerId === transferrer.id ||
                         await this.hasAdminPermission(transferrer, resourceType);

      if (!canTransfer) {
        throw new Error('Insufficient permissions to transfer ownership');
      }

      // Verify new owner is in same organization
      const newOwner = await this.prisma.user.findFirst({
        where: {
          id: newOwnerId,
          organizationId: transferrer.organizationId,
          isActive: true,
        },
      });

      if (!newOwner) {
        throw new Error('New owner not found or not in same organization');
      }

      // Transfer ownership
      await this.prisma.resource.update({
        where: { id: resource.id },
        data: { ownerId: newOwnerId },
      });

      // Log the transfer
      await this.prisma.auditLog.create({
        data: {
          userId: transferredBy,
          action: 'TRANSFER_OWNERSHIP',
          resource: 'RESOURCE_OWNERSHIP',
          resourceId: resource.id,
          oldValues: { ownerId: resource.ownerId },
          newValues: { ownerId: newOwnerId },
          organizationId: transferrer.organizationId,
        },
      });

      return true;
    } catch (error) {
      console.error('Error transferring resource ownership:', error);
      return false;
    }
  }

  /**
   * Set resource visibility
   */
  async setResourceVisibility(
    resourceType: string,
    resourceId: string,
    visibility: 'PRIVATE' | 'ORGANIZATION' | 'PUBLIC' | 'RESTRICTED',
    setBy: string
  ): Promise<boolean> {
    try {
      const user = await this.getUserWithPermissions(setBy);
      if (!user) {
        throw new Error('User not found');
      }

      const resource = await this.prisma.resource.findFirst({
        where: {
          resourceType,
          resourceId,
          organizationId: user.organizationId,
        },
      });

      if (!resource) {
        throw new Error('Resource not found');
      }

      // Check if user can modify visibility
      const canModify = resource.ownerId === user.id ||
                       await this.hasAdminPermission(user, resourceType);

      if (!canModify) {
        throw new Error('Insufficient permissions to modify resource visibility');
      }

      // Update visibility
      await this.prisma.resource.update({
        where: { id: resource.id },
        data: { visibility },
      });

      return true;
    } catch (error) {
      console.error('Error setting resource visibility:', error);
      return false;
    }
  }

  /**
   * Private helper methods
   */
  private async getOrCreateResource(
    resourceType: string,
    resourceId: string,
    organizationId: string,
    ownerId?: string
  ) {
    let resource = await this.prisma.resource.findFirst({
      where: {
        resourceType,
        resourceId,
        organizationId,
      },
    });

    if (!resource) {
      resource = await this.prisma.resource.create({
        data: {
          resourceType,
          resourceId,
          organizationId,
          ownerId,
          visibility: 'PRIVATE',
        },
      });
    }

    return resource;
  }

  private async hasGeneralResourcePermission(user: EnhancedUser, permission: string): Promise<boolean> {
    const userPermissions = this.getUserPermissions(user);
    return userPermissions.includes(permission) || userPermissions.includes('*');
  }

  private async hasSpecificResourcePermission(
    user: EnhancedUser,
    resourceId: string,
    action: string
  ): Promise<boolean> {
    const permission = await this.prisma.resourcePermission.findFirst({
      where: {
        resourceId,
        OR: [
          { userId: user.id },
          { roleId: { in: user.roles.map(r => r.id) } },
        ],
        permissionType: action,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return !!permission;
  }

  private evaluateResourceAccess(params: {
    user: EnhancedUser;
    resourceType: string;
    resourceId: string;
    action: string;
    hasGeneralPermission: boolean;
    hasSpecificPermission: boolean;
    isOwner: boolean;
    resource: any;
    context: PermissionContext;
  }): PermissionResult {
    const {
      user,
      resourceType,
      action,
      hasGeneralPermission,
      hasSpecificPermission,
      isOwner,
      resource,
    } = params;

    // Super admin always has access
    const userPermissions = this.getUserPermissions(user);
    if (userPermissions.includes('*') || userPermissions.includes(SYSTEM_PERMISSIONS.PLATFORM_ADMIN)) {
      return {
        granted: true,
        reason: 'Super admin access',
      };
    }

    // Resource owner has full access (except for some restricted actions)
    if (isOwner && !this.isRestrictedOwnerAction(action)) {
      return {
        granted: true,
        reason: 'Resource owner access',
      };
    }

    // Check visibility restrictions
    if (resource.visibility === 'PRIVATE' && !isOwner && !hasSpecificPermission) {
      return {
        granted: false,
        reason: 'Resource is private and no specific permission granted',
        suggestions: ['Request access from resource owner'],
      };
    }

    // Check organization boundary
    if (resource.organizationId !== user.organizationId) {
      return {
        granted: false,
        reason: 'Cannot access resources from different organization',
        riskAssessment: {
          level: 'HIGH',
          factors: ['Cross-organization access attempt'],
        },
      };
    }

    // Check general permissions
    if (hasGeneralPermission) {
      return {
        granted: true,
        reason: 'General resource permission granted',
      };
    }

    // Check specific permissions
    if (hasSpecificPermission) {
      return {
        granted: true,
        reason: 'Specific resource permission granted',
      };
    }

    // Check read access for organization-visible resources
    if (resource.visibility === 'ORGANIZATION' && action.toLowerCase() === 'read') {
      return {
        granted: true,
        reason: 'Organization-wide read access',
      };
    }

    // Check public read access
    if (resource.visibility === 'PUBLIC' && action.toLowerCase() === 'read') {
      return {
        granted: true,
        reason: 'Public read access',
      };
    }

    // Default deny
    return {
      granted: false,
      reason: `No permission to ${action} ${resourceType} resource`,
      missingPermissions: [`${action.toUpperCase()}_${resourceType.toUpperCase()}`],
      suggestions: [
        'Request permission from resource owner',
        'Request role with appropriate permissions',
      ],
    };
  }

  private isRestrictedOwnerAction(action: string): boolean {
    // Some actions might be restricted even for owners
    const restrictedActions = ['delete_organization', 'transfer_organization'];
    return restrictedActions.includes(action.toLowerCase());
  }

  private async canGrantResourcePermission(
    granter: EnhancedUser,
    resource: any,
    permissionType: string
  ): Promise<boolean> {
    // Resource owner can grant permissions
    if (resource.ownerId === granter.id) {
      return true;
    }

    // Check if granter has admin permission for this resource type
    return this.hasAdminPermission(granter, resource.resourceType);
  }

  private async canRevokeResourcePermission(
    revoker: EnhancedUser,
    resource: any,
    permissionType: string
  ): Promise<boolean> {
    // Resource owner can revoke permissions
    if (resource.ownerId === revoker.id) {
      return true;
    }

    // Check if revoker has admin permission for this resource type
    return this.hasAdminPermission(revoker, resource.resourceType);
  }

  private async hasAdminPermission(user: EnhancedUser, resourceType: string): Promise<boolean> {
    const userPermissions = this.getUserPermissions(user);

    return userPermissions.includes('*') ||
           userPermissions.includes(SYSTEM_PERMISSIONS.MANAGE_ORGANIZATION) ||
           userPermissions.includes(`MANAGE_${resourceType.toUpperCase()}`);
  }

  private getUserPermissions(user: EnhancedUser): string[] {
    const permissions = new Set<string>();

    // Add role permissions
    user.roles.forEach(role => {
      role.permissions.forEach(p => permissions.add(p));
      role.rolePermissions?.forEach(rp => {
        if (rp.isActive && (!rp.expiresAt || rp.expiresAt > new Date())) {
          permissions.add(rp.permission.code);
        }
      });
    });

    // Add direct user permissions
    user.userPermissions?.forEach(up => {
      if (up.isActive && (!up.expiresAt || up.expiresAt > new Date())) {
        permissions.add(up.permission.code);
      }
    });

    return Array.from(permissions);
  }

  private async getUserWithPermissions(userId: string): Promise<EnhancedUser | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              rolePermissions: {
                include: { permission: true },
                where: { isActive: true }
              }
            }
          },
          userPermissions: {
            include: { permission: true },
            where: { isActive: true }
          },
          organization: true,
        }
      });

      return user as EnhancedUser | null;
    } catch (error) {
      console.error('Error fetching user with permissions:', error);
      return null;
    }
  }
}
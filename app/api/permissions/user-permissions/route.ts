/**
 * API Route: /api/permissions/user-permissions
 *
 * Returns comprehensive user permissions and role information.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enhanced user with all permission data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
          include: { permission: true, resource: true },
          where: { isActive: true }
        },
        organization: true,
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 403 });
    }

    // Compute effective permissions
    const permissions = new Set<string>();

    // Add role-based permissions
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

    return NextResponse.json({
      user,
      permissions: Array.from(permissions),
      effectiveRole: user.roles.length > 0
        ? user.roles.sort((a, b) => (a.hierarchyLevel || 999) - (b.hierarchyLevel || 999))[0].code
        : 'viewer',
      hierarchyLevel: user.roles.length > 0
        ? Math.min(...user.roles.map(role => role.hierarchyLevel || 999))
        : 999,
    });
  } catch (error) {
    console.error('User permissions API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
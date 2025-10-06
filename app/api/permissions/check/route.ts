/**
 * API Route: /api/permissions/check
 *
 * Handles single permission checks for authenticated users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PermissionManager } from '@/lib/enterprise-permissions/manager';
import { PrismaClient } from '@prisma/client';
import type { PermissionContext } from '@/lib/enterprise-permissions/types';

const prisma = new PrismaClient();
const permissionManager = new PermissionManager(prisma);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await req.json();
    const { permission, context }: { permission: string; context?: PermissionContext } = body;

    if (!permission) {
      return NextResponse.json({ error: 'Permission is required' }, { status: 400 });
    }

    // Get enhanced user
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

    // Build permission context
    const permissionContext: PermissionContext = {
      userId: user.id,
      organizationId: user.organizationId,
      ipAddress: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || undefined,
      timestamp: new Date(),
      ...context,
    };

    // Check permission
    const result = await permissionManager.hasPermission(user as any, permission, permissionContext);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Permission check API error:', error);
    return NextResponse.json(
      {
        error: 'Permission check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
/**
 * API Route: /api/permissions/refresh
 *
 * Refreshes user permissions cache.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PermissionManager } from '@/lib/enterprise-permissions/manager';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const permissionManager = new PermissionManager(prisma);

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Refresh permissions cache
    await permissionManager.refreshPermissions(session.user.id);

    return NextResponse.json({ success: true, message: 'Permissions refreshed' });
  } catch (error) {
    console.error('Permission refresh API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to refresh permissions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
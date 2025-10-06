/**
 * API Route: /api/permissions/user-roles
 *
 * Returns user's roles and role hierarchy information.
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

    // Get user roles
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
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 403 });
    }

    return NextResponse.json(user.roles);
  } catch (error) {
    console.error('User roles API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
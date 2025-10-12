import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/prisma/db"
import { verifyPassword } from "@/lib/password"

export const runtime = 'nodejs' // Force Node.js runtime for bcrypt

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Verify credentials API called')
    const { email, password } = await request.json()
    console.log('📧 Email:', email)

    if (!email || !password) {
      console.log('❌ Missing email or password')
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user with organization and roles
    const user = await prisma.user.findUnique({
      where: {
        email: email,
        isActive: true
      },
      include: {
        organization: true,
        roles: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      console.log('❌ User not found or inactive')
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('✅ User found:', user.email)

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      console.log('❌ Password verification failed')
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    console.log('✅ Password verified successfully')

    // Flatten all permissions from all roles
    const allPermissions = user.roles.reduce((acc, role) => {
      // Get permissions from role.permissions array (direct permissions)
      // AND from rolePermissions relationship (linked permissions)
      const directPermissions = role.permissions || []
      const linkedPermissions = role.rolePermissions?.map(rp => rp.permission.code) || []
      return [...acc, ...directPermissions, ...linkedPermissions]
    }, [] as string[])

    // Remove duplicates
    const uniquePermissions = [...new Set(allPermissions)]

    // Return user data for NextAuth
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      image: user.image,
      organizationId: user.organizationId,
      organizationName: user.organization?.name,
      roles: user.roles.map(role => ({
        id: role.id,
        name: role.name,
        code: role.code,
        permissions: role.permissions
      })),
      permissions: uniquePermissions
    }

    console.log('🎉 Authentication successful, returning user data')
    return NextResponse.json({ user: userData }, { status: 200 })
  } catch (error) {
    console.error("❌ Credential verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
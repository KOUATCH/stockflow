import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/password"

export const runtime = 'nodejs' // Force Node.js runtime for bcrypt

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
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
          where: {
            organization: {
              isActive: true
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Verify password using bcrypt
    const isPasswordValid = await verifyPassword(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Flatten all permissions from all roles
    const allPermissions = user.roles.reduce((acc, role) => {
      return [...acc, ...role.permissions]
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

    return NextResponse.json({ user: userData }, { status: 200 })
  } catch (error) {
    console.error("Credential verification error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
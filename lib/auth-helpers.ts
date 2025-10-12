import { prisma } from "@/prisma/db"

export async function getUserWithRoles(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        },
        roles: {
          select: {
            id: true,
            name: true,
            code: true,
            permissions: true,
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })

    return user
  } catch (error) {
    console.error("Error fetching user with roles:", error)
    return null
  }
}

export async function getUserPermissions(userId: string) {
  try {
    const user = await getUserWithRoles(userId)

    if (!user) {
      return []
    }

    // Flatten all permissions from all roles
    const allPermissions = user.roles.reduce((acc, role) => {
      // Get permissions from role.permissions array (direct permissions)
      // AND from rolePermissions relationship (linked permissions)
      const directPermissions = role.permissions || []
      const linkedPermissions = role.rolePermissions?.map(rp => rp.permission.code) || []
      return [...acc, ...directPermissions, ...linkedPermissions]
    }, [] as string[])

    // Remove duplicates and return
    return [...new Set(allPermissions)]
  } catch (error) {
    console.error("Error fetching user permissions:", error)
    return []
  }
}

export async function userHasPermission(userId: string, permission: string) {
  try {
    const permissions = await getUserPermissions(userId)
    return permissions.includes(permission)
  } catch (error) {
    console.error("Error checking user permission:", error)
    return false
  }
}

export async function userHasAnyPermission(userId: string, permissions: string[]) {
  try {
    const userPermissions = await getUserPermissions(userId)
    return permissions.some(permission => userPermissions.includes(permission))
  } catch (error) {
    console.error("Error checking user permissions:", error)
    return false
  }
}

export async function userHasAllPermissions(userId: string, permissions: string[]) {
  try {
    const userPermissions = await getUserPermissions(userId)
    return permissions.every(permission => userPermissions.includes(permission))
  } catch (error) {
    console.error("Error checking user permissions:", error)
    return false
  }
}
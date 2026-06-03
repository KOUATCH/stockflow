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
            nameEn: true,
            nameFr: true,
            code: true,
            permissions: true,
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
    const allPermissions = user.roles.reduce<string[]>((acc, role) => {
      const directPermissions = role.permissions || []
      return [...acc, ...directPermissions]
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

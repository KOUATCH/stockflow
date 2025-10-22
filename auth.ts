import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db as prisma } from "./prisma/db"
// Password verification will be done server-side in API routes
import type { NextAuthConfig } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      firstName?: string | null
      lastName?: string | null
      phone?: string | null
      organizationId: string
      organizationName?: string | null
      roles: Array<{
        id: string
        name: string
        code: string
        permissions: string[]
      }>
      permissions: string[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    organizationId: string
    organizationName?: string | null
    roles: Array<{
      id: string
      name: string
      code: string
      permissions: string[]
    }>
    permissions: string[]
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    email: string
    organizationId: string
    organizationName?: string | null
    roles: Array<{
      id: string
      name: string
      code: string
      permissions: string[]
    }>
    permissions: string[]
  }
}

const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials in authorize function')
          return null
        }

        try {
          console.log('🔍 Authorizing credentials for:', credentials.email)

          // Find user with organization and roles directly
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email as string,
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
            console.log('❌ User not found or inactive for:', credentials.email)
            return null
          }

          console.log('✅ User found:', user.email)

          // Verify password using bcrypt
          const { verifyPassword } = await import('./lib/password')
          const isPasswordValid = await verifyPassword(credentials.password as string, user.password)

          if (!isPasswordValid) {
            console.log('❌ Password verification failed for:', credentials.email)
            return null
          }

          console.log('✅ Password verified successfully for:', credentials.email)

          // Flatten all permissions from all roles
          const allPermissions = (user.roles || []).reduce((acc, role) => {
            // Get permissions from role.permissions array (direct permissions)
            // AND from rolePermissions relationship (linked permissions)
            const directPermissions = role.permissions || []
            const linkedPermissions = role.rolePermissions?.map(rp => rp.permission.code) || []
            return [...acc, ...directPermissions, ...linkedPermissions]
          }, [] as string[])

          // Remove duplicates
          const uniquePermissions = Array.from(new Set(allPermissions))

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
            roles: (user.roles || []).map(role => ({
              id: role.id,
              name: role.name,
              code: role.code,
              permissions: role.permissions as string[]
            })),
            permissions: uniquePermissions as string[]
          }

          console.log('🎉 Authentication successful for:', credentials.email)
          return userData
        } catch (error) {
          console.error("❌ Authorization error:", error)
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id as string
        token.email = user.email as string
        token.organizationId = user.organizationId as string
        token.organizationName = user.organizationName as string | null
        // Store only essential role info to reduce cookie size (remove permissions from roles)
        token.roles = user.roles?.map(role => ({
          id: role.id,
          name: role.name,
          code: role.code,
          permissions: role.permissions
        })) || []
        // Store only essential permissions to reduce cookie size
        token.permissions = user.permissions?.slice(0, 10) || [] // Limit to first 10 permissions
      }

      // Return previous token if the access token has not expired yet
      return token
    },
    async session({ session, token }) {
      // Use data from JWT token instead of fresh database fetch to avoid edge runtime issues
      if (token.id) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          emailVerified: null,
          name: session.user?.name || null,
          firstName: session.user?.firstName || null,
          lastName: session.user?.lastName || null,
          phone: session.user?.phone || null,
          image: session.user?.image || null,
          organizationId: token.organizationId as string,
          organizationName: token.organizationName as string | null,
          roles: (token.roles as Array<{
            id: string
            name: string
            code: string
            permissions: string[]
          }>) || [],
          permissions: (token.permissions as string[]) || []
        }
      }

      return session
    },
    async signIn({ user, account, profile }) {
      // Handle Google OAuth
      if (account?.provider === "google" && profile) {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email! },
            include: { organization: true }
          })

          if (!existingUser) {
            // For Google sign-in, you might want to create a default organization
            // or require manual account creation first
            return false
          }

          return true
        } catch (error) {
          console.error("Google sign-in error:", error)
          return false
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // Fixes logout redirect port issue
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)
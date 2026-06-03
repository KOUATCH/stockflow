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
        nameEn?: string | null
        nameFr?: string | null
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
    image?: string | null
    organizationId: string
    organizationName?: string | null
      roles: Array<{
        id: string
        name: string
        nameEn?: string | null
        nameFr?: string | null
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
    firstName?: string | null
    lastName?: string | null
    phone?: string | null
    image?: string | null
    roles: Array<{
      id: string
      name: string
      nameEn?: string | null
      nameFr?: string | null
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
          return null
        }

        try {
          const email = String(credentials.email).trim().toLowerCase()
          const password = String(credentials.password)

          // Find user with organization and roles directly
          const user = await prisma.user.findFirst({
            where: {
              email: { equals: email, mode: "insensitive" },
              isActive: true,
            },
            include: {
              organization: true,
              roles: true
            }
          })

          if (!user) {
            return null
          }

          if (!user.password) {
            return null
          }

          const now = new Date()
          if (user.lockedUntil && user.lockedUntil > now) {
            return null
          }

          if (!user.isVerified) {
            return null
          }

          // Verify password using Argon2id
          const { verifyPassword } = await import('./lib/password')
          const isPasswordValid = await verifyPassword(password, user.password)

          if (!isPasswordValid) {
            const failedLoginAttempts = (user.failedLoginAttempts ?? 0) + 1
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts,
                lastFailedLogin: now,
                ...(failedLoginAttempts >= 5
                  ? {
                      isLocked: true,
                      lockedUntil: new Date(now.getTime() + 30 * 60 * 1000),
                    }
                  : {}),
              },
            })
            return null
          }

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              isLocked: false,
              lockedUntil: null,
              lastLogin: now,
            },
          })

          // Flatten all permissions from all roles
          const allPermissions = (user.roles || []).reduce((acc, role) => {
            // Get permissions from the current Role.permissions array.
            const directPermissions = role.permissions || []
            return [...acc, ...directPermissions]
          }, [] as string[])

          // Remove duplicates
          const uniquePermissions = Array.from(new Set(allPermissions))

          // Return user data for NextAuth
          const userData = {
            id: user.id,
            email: user.email,
            name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            image: user.image,
            organizationId: user.organizationId,
            organizationName: user.organization?.name,
            roles: (user.roles || []).map(role => ({
              id: role.id,
              name: role.nameEn || role.nameFr || role.code,
              nameEn: role.nameEn,
              nameFr: role.nameFr,
              code: role.code,
              permissions: role.permissions as string[]
            })),
            permissions: uniquePermissions as string[]
          }

          return userData
        } catch (error) {
          console.error("Authorization error")
          return null
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        token.id = user.id as string
        token.email = user.email as string
        token.firstName = user.firstName as string | null
        token.lastName = user.lastName as string | null
        token.phone = user.phone as string | null
        token.image = user.image as string | null
        token.organizationId = user.organizationId as string
        token.organizationName = user.organizationName as string | null
        // Store only essential role info to reduce cookie size (remove permissions from roles)
        token.roles = user.roles?.map(role => ({
          id: role.id,
          name: role.name,
          nameEn: role.nameEn,
          nameFr: role.nameFr,
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
          name: [token.firstName, token.lastName].filter(Boolean).join(" ") || session.user?.name || null,
          firstName: token.firstName as string | null,
          lastName: token.lastName as string | null,
          phone: token.phone as string | null,
          image: token.image as string | null,
          organizationId: token.organizationId as string,
          organizationName: token.organizationName as string | null,
          roles: (token.roles as Array<{
            id: string
            name: string
            nameEn?: string | null
            nameFr?: string | null
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
          if (!profile.email) return false

          // Check if user exists
          const existingUser = await prisma.user.findFirst({
            where: { email: { equals: profile.email, mode: "insensitive" } },
            include: { organization: true }
          })

          if (!existingUser || !existingUser.isActive || !existingUser.isVerified) {
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
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
    updateAge: 60 * 60, // refresh claims hourly
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  trustHost: process.env.NODE_ENV !== "production" || process.env.AUTH_TRUST_HOST === "true",
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

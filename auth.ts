import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
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

declare module "next-auth/jwt" {
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
          return null
        }

        try {
          // Use the dedicated API route for credential verification
          const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || `http://localhost:3003`

          const response = await fetch(`${baseUrl}/api/auth/verify-credentials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            console.error("Credential verification failed:", response.status, await response.text())
            return null
          }

          const { user } = await response.json()
          return user
        } catch (error) {
          console.error("Auth error:", error)
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
        token.id = user.id
        token.email = user.email!
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
        token.roles = user.roles
        token.permissions = user.permissions
      }

      // Return previous token if the access token has not expired yet
      return token
    },
    async session({ session, token }) {
      // Use data from JWT token instead of fresh database fetch to avoid edge runtime issues
      if (token.id) {
        session.user = {
          id: token.id,
          email: token.email,
          name: session.user.name, // Keep name from session as it might be updated
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          phone: session.user.phone,
          image: session.user.image,
          organizationId: token.organizationId,
          organizationName: token.organizationName,
          roles: token.roles,
          permissions: token.permissions
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
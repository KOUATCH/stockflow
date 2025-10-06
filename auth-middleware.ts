import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import type { NextAuthConfig } from "next-auth"

// Auth configuration for middleware (Edge Runtime compatible)
// This excludes the credentials provider which requires bcrypt
const config = {
  adapter: PrismaAdapter(prisma),
  providers: [
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

export const { auth } = NextAuth(config)
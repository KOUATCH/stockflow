import { handlers } from "@/auth"
import type { NextRequest } from "next/server"

// Force Node.js runtime to allow Prisma and Argon2id to work
export const runtime = 'nodejs'

// Add error handling for the auth API routes
const { GET: originalGET, POST: originalPOST } = handlers

export const GET = async (req: NextRequest) => {
  try {
    return await originalGET(req)
  } catch (error) {
    console.error('Auth GET error:', error)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export const POST = async (req: NextRequest) => {
  try {
    return await originalPOST(req)
  } catch (error) {
    console.error('Auth POST error:', error)
    return new Response(JSON.stringify({ error: 'Authentication error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

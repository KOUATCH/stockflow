import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

// Security headers for all responses
const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": process.env.NODE_ENV === "production" ? "max-age=31536000; includeSubDomains" : "",
  "Content-Security-Policy": `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https: wss:;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s+/g, ' ').trim(),
}

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit function
function rateLimit(ip: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now()
  const clientData = rateLimitStore.get(ip)

  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (clientData.count >= maxRequests) {
    return false
  }

  clientData.count++
  return true
}

// Get client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  )
}

export default auth((req) => {
  const { pathname, search } = req.nextUrl
  const clientIP = getClientIP(req)
  const isAuthenticated = !!req.auth?.user
  const hasOrgId = !!req.auth?.user?.organizationId

  // Define protected and public routes first
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/forgot-password") || pathname.startsWith("/reset-password") || pathname.startsWith("/verify")
  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isHomeRoute = pathname === "/" || pathname === ""

  // Skip middleware for static files and assets
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth/") ||
    pathname.includes(".") && !pathname.includes("/api/")
  ) {
    return NextResponse.next()
  }

  // Apply rate limiting (except for auth routes to avoid blocking login attempts)
  if (!isAuthRoute && !rateLimit(clientIP, 200, 60000)) {
    const response = new NextResponse(
      JSON.stringify({ error: "Too many requests" }),
      { status: 429, headers: { "content-type": "application/json" } }
    )

    Object.entries(securityHeaders).forEach(([key, value]) => {
      if (value) response.headers.set(key, value)
    })

    return response
  }

  // Handle home route - allow it to load normally, let Next.js routing handle it
  if (isHomeRoute) {
    // Don't redirect here, let the page itself handle the logic
    return NextResponse.next()
  }

  // Handle auth routes
  if (isAuthRoute) {
    // If already authenticated and has org, redirect to dashboard
    if (isAuthenticated && hasOrgId) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
      const redirectUrl = callbackUrl && callbackUrl.startsWith("/")
        ? callbackUrl
        : "/dashboard"
      return NextResponse.redirect(new URL(redirectUrl, req.url))
    }
    // Allow access to auth routes for unauthenticated users
    return NextResponse.next()
  }

  // Handle dashboard routes
  if (isDashboardRoute) {
    // Check authentication
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname + search)
      return NextResponse.redirect(loginUrl)
    }

    // Check organization requirement
    if (!hasOrgId) {
      return NextResponse.redirect(new URL("/register", req.url))
    }

    // Allow access to dashboard
    return NextResponse.next()
  }

  // Create response and add security headers
  const response = NextResponse.next()

  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) response.headers.set(key, value)
  })

  // Add CORS headers for API routes
  if (pathname.startsWith("/api")) {
    response.headers.set("Access-Control-Allow-Origin", req.nextUrl.origin)
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.set("Access-Control-Allow-Credentials", "true")
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: response.headers })
  }

  return response
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
}
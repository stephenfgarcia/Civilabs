import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

/**
 * Authentication and Authorization Middleware
 * Protects routes and handles role-based access control
 */

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']

// Admin-only routes
const adminRoutes = ['/admin']

// Instructor routes (instructors and admins)
const instructorRoutes = ['/instructor']

interface TokenPayload {
  userId: number | string
  email: string
  role: string
  firstName: string
  lastName: string
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Get authentication token from cookie
  const token = request.cookies.get('authToken')?.value

  // If no token and route is protected, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT token with proper cryptographic verification
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    const userRole = payload.role

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    if (isAdminRoute && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      console.warn(`Unauthorized admin access attempt by user ${payload.userId} (${payload.email}) with role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check instructor routes
    const isInstructorRoute = instructorRoutes.some(route => pathname.startsWith(route))
    if (isInstructorRoute && !['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      console.warn(`Unauthorized instructor access attempt by user ${payload.userId} (${payload.email}) with role ${userRole}`)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to headers for use in API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', String(payload.userId))
    response.headers.set('x-user-role', payload.role)
    response.headers.set('x-user-email', payload.email)

    return response
  } catch (error) {
    // Invalid or expired token, redirect to login
    console.error('Authentication middleware error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      pathname,
      timestamp: new Date().toISOString(),
    })

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    loginUrl.searchParams.set('error', 'session_expired')

    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('authToken')

    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately in API middleware)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

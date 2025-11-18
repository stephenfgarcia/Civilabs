import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Authentication and Authorization Middleware
 * Protects routes and handles role-based access control
 */

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password']

// Admin-only routes
const adminRoutes = ['/admin']

// Instructor routes (instructors and admins)
const instructorRoutes = ['/instructor']

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

  // Decode JWT token (simplified - in production use proper JWT verification)
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    const userRole = payload.role

    // Check admin routes
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
    if (isAdminRoute && !['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Check instructor routes
    const isInstructorRoute = instructorRoutes.some(route => pathname.startsWith(route))
    if (isInstructorRoute && !['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to headers for use in API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId)
    response.headers.set('x-user-role', payload.role)

    return response
  } catch (error) {
    // Invalid token, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)

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

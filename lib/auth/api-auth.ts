/**
 * API Route Authentication Helpers
 * Middleware and utilities for protecting API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, TokenPayload } from './auth-helpers'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Fallback to cookie
  return request.cookies.get('authToken')?.value || null
}

/**
 * Authenticate API request
 * Returns user payload if authenticated, null otherwise
 */
export function authenticateRequest(request: NextRequest): TokenPayload | null {
  const token = extractToken(request)

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * API middleware to require authentication
 * Usage: const user = await requireApiAuth(request)
 */
export function requireApiAuth(request: NextRequest): TokenPayload {
  const user = authenticateRequest(request)

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}

/**
 * API middleware to require specific role
 */
export function requireApiRole(
  request: NextRequest,
  allowedRoles: ('admin' | 'instructor' | 'learner' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'LEARNER')[]
): TokenPayload {
  const user = requireApiAuth(request)

  // Normalize role comparison (handle both lowercase and UPPERCASE enum values)
  const userRole = user.role.toLowerCase()
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase())

  if (!normalizedAllowedRoles.includes(userRole)) {
    throw new Error('Forbidden')
  }

  return user
}

/**
 * API middleware to require admin role
 */
export function requireApiAdmin(request: NextRequest): TokenPayload {
  return requireApiRole(request, ['admin'])
}

/**
 * API middleware to require instructor or admin role
 */
export function requireApiInstructor(request: NextRequest): TokenPayload {
  return requireApiRole(request, ['admin', 'instructor'])
}

/**
 * Wrapper for API route handlers with authentication
 * Supports both regular routes and dynamic routes with params
 */
export function withAuth<T = any>(
  handler: (request: NextRequest, user: TokenPayload, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = requireApiAuth(request)
      return await handler(request, user, context)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error instanceof Error && error.message === 'Forbidden') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrapper for API route handlers with role requirement
 * Supports both regular routes and dynamic routes with params
 */
export function withRole<T = any>(
  allowedRoles: ('admin' | 'instructor' | 'learner' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'LEARNER')[],
  handler: (request: NextRequest, user: TokenPayload, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      const user = requireApiRole(request, allowedRoles)
      return await handler(request, user, context)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        )
      }
      if (error instanceof Error && error.message === 'Forbidden') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Insufficient permissions' },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Wrapper for admin-only API routes
 */
export function withAdmin(
  handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>
) {
  return withRole(['admin', 'SUPER_ADMIN', 'ADMIN'], handler)
}

/**
 * Wrapper for instructor (and admin) API routes
 */
export function withInstructor(
  handler: (request: NextRequest, user: TokenPayload) => Promise<NextResponse>
) {
  return withRole(['admin', 'instructor', 'SUPER_ADMIN', 'ADMIN', 'INSTRUCTOR'], handler)
}

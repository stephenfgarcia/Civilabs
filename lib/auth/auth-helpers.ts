/**
 * Authentication Helper Functions
 * Utilities for auth operations, token management, and protected actions
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

export interface TokenPayload {
  userId: number | string
  email: string
  role: 'admin' | 'instructor' | 'learner' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'LEARNER'
  firstName: string
  lastName: string
}

/**
 * Generate JWT token
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    return null
  }
}

/**
 * Get current user from cookies (server-side)
 */
export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

/**
 * Require authentication - throws redirect if not authenticated
 */
export async function requireAuth(): Promise<TokenPayload> {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require specific role - throws redirect if user doesn't have required role
 */
export async function requireRole(
  allowedRoles: ('admin' | 'instructor' | 'learner' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'LEARNER')[]
): Promise<TokenPayload> {
  const user = await requireAuth()

  // Normalize role comparison
  const userRole = user.role.toLowerCase()
  const normalizedRoles = allowedRoles.map(r => r.toLowerCase())

  if (!normalizedRoles.includes(userRole)) {
    redirect('/dashboard')
  }

  return user
}

/**
 * Require admin role
 */
export async function requireAdmin(): Promise<TokenPayload> {
  return requireRole(['admin'])
}

/**
 * Require instructor or admin role
 */
export async function requireInstructor(): Promise<TokenPayload> {
  return requireRole(['admin', 'instructor'])
}

/**
 * Check if user has permission
 */
export function hasPermission(
  user: TokenPayload,
  requiredRole: 'admin' | 'instructor' | 'learner' | 'SUPER_ADMIN' | 'ADMIN' | 'INSTRUCTOR' | 'LEARNER'
): boolean {
  const roleHierarchy: Record<string, number> = {
    'super_admin': 4,
    'admin': 3,
    'instructor': 2,
    'learner': 1,
  }

  const userRole = user.role.toLowerCase()
  const required = requiredRole.toLowerCase()

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[required] || 0)
}

/**
 * Set auth cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/**
 * Clear auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('authToken')
}

/**
 * Refresh token - extend expiration
 */
export async function refreshToken(): Promise<string | null> {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const newToken = generateToken(user)
  await setAuthCookie(newToken)

  return newToken
}

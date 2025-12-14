import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret'
    ) as JWTPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

export async function verifyAuth(request: NextRequest): Promise<{
  authenticated: boolean
  user: JWTPayload | null
}> {
  try {
    // Try to get token from Authorization header first
    let token = getTokenFromRequest(request)

    // If not in header, try to get from cookie
    if (!token) {
      token = request.cookies.get('authToken')?.value || null
    }

    if (!token) {
      return { authenticated: false, user: null }
    }

    const user = verifyToken(token)
    if (!user) {
      return { authenticated: false, user: null }
    }

    return { authenticated: true, user }
  } catch (error) {
    return { authenticated: false, user: null }
  }
}

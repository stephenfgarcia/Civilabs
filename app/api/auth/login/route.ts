import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/utils/prisma'
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  // Apply rate limiting (5 attempts per 15 minutes)
  const rateLimit = checkRateLimit(request, RATE_LIMITS.AUTH)
  if (rateLimit.limited) {
    return createRateLimitResponse(rateLimit.resetTime)
  }

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Both worker email and security code are required to access the site.' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format. Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: true,
      },
    })

    // Generic error message to prevent user enumeration
    const genericErrorMessage = 'Invalid email or security code. Please check your credentials and try again.'

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: genericErrorMessage },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: genericErrorMessage },
        { status: 401 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your worker account has been suspended or deactivated. Please contact site administrator.' },
        { status: 403 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    })

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with user data and token
    const response = NextResponse.json({
      token, // Include token for client-side storage
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        department: user.department,
      },
      message: 'Login successful',
    })

    // Set HTTP-only cookie for secure authentication
    // This prevents XSS attacks as JavaScript cannot access httpOnly cookies
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

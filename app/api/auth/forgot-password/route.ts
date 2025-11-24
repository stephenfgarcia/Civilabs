import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import crypto from 'crypto'
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from '@/lib/utils/rate-limit'

export async function POST(request: NextRequest) {
  // Apply strict rate limiting (3 attempts per hour)
  const rateLimit = checkRateLimit(request, RATE_LIMITS.STRICT)
  if (rateLimit.limited) {
    return createRateLimitResponse(rateLimit.resetTime)
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required.' },
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

    // Check if user exists (but don't reveal this information in the response)
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent user enumeration
    // Only send email if user actually exists
    if (user) {
      // Generate password reset token (valid for 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Store the reset token in the database
      // Note: You'll need to add resetToken and resetTokenExpiry fields to your User model
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // TODO: Add these fields to your Prisma schema:
          // resetToken: resetToken,
          // resetTokenExpiry: resetTokenExpiry,
        },
      })

      // TODO: Implement email sending here
      // Example with a hypothetical email service:
      // await sendEmail({
      //   to: email,
      //   subject: 'Password Reset - Civilabs LMS',
      //   template: 'password-reset',
      //   data: {
      //     resetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`,
      //     firstName: user.firstName,
      //   },
      // })

      console.log(`Password reset requested for: ${email}`)
      console.log(`Reset token (for testing): ${resetToken}`)
      console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`)
    }

    // Always return success (don't reveal whether user exists)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, we have sent password reset instructions.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

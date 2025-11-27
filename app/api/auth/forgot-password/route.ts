import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import crypto from 'crypto'
import { checkRateLimit, createRateLimitResponse, RATE_LIMITS } from '@/lib/utils/rate-limit'

// Email sending function - uses console in development, can be extended for production
async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string
): Promise<boolean> {
  // In production, integrate with email service (SendGrid, Nodemailer, AWS SES, etc.)
  // For now, log to console for development/testing
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction && process.env.SMTP_HOST) {
    // Production email sending would go here
    // Example: await sendWithNodemailer({ to: email, subject: '...', html: '...' })
    console.log(`[EMAIL] Would send password reset email to: ${email}`)
  }

  // Always log for development/debugging
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 PASSWORD RESET EMAIL')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`To: ${email}`)
  console.log(`Name: ${firstName}`)
  console.log(`Subject: Password Reset - Civilabs LMS`)
  console.log('')
  console.log(`Hi ${firstName},`)
  console.log('')
  console.log('You requested to reset your password. Click the link below:')
  console.log(`🔗 ${resetUrl}`)
  console.log('')
  console.log('This link expires in 1 hour.')
  console.log('If you did not request this, please ignore this email.')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  return true
}

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
    // Only process if user actually exists
    if (user) {
      // Generate password reset token (valid for 1 hour)
      const resetToken = crypto.randomBytes(32).toString('hex')
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour from now

      // Store the reset token in the database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: resetToken,
          resetTokenExpiry: resetTokenExpiry,
        },
      })

      // Build reset URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

      // Send password reset email
      await sendPasswordResetEmail(email, user.firstName, resetUrl)
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

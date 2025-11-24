import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/utils/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Reset token and new password are required.' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Security code must be at least 8 characters long for site protection.' },
        { status: 400 }
      )
    }

    // TODO: Find user by reset token and check expiry
    // Note: You'll need to add resetToken and resetTokenExpiry fields to your User model
    // const user = await prisma.user.findFirst({
    //   where: {
    //     resetToken: token,
    //     resetTokenExpiry: {
    //       gte: new Date(), // Token must not be expired
    //     },
    //   },
    // })

    // TEMPORARY: For demo purposes, we'll skip token validation
    // In production, you MUST implement proper token validation
    console.warn('⚠️  WARNING: Password reset token validation is not fully implemented!')
    console.warn('⚠️  You need to add resetToken and resetTokenExpiry fields to your Prisma User model')

    // For now, just return an error message asking to implement this feature
    return NextResponse.json(
      {
        error: 'Password reset feature requires database schema update. Please contact administrator.',
        details: 'Add resetToken and resetTokenExpiry fields to User model in Prisma schema'
      },
      { status: 501 } // 501 Not Implemented
    )

    // PRODUCTION CODE (uncomment after adding fields to schema):
    /*
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token. Please request a new password reset.' },
        { status: 400 }
      )
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    })
    */
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

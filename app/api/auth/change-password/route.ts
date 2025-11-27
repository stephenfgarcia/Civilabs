import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/auth/change-password
 * Change the authenticated user's password
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { currentPassword, newPassword } = await request.json()

      // Validate required fields
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required.' },
          { status: 400 }
        )
      }

      // Validate new password length
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long.' },
          { status: 400 }
        )
      }

      // Get user from database
      const dbUser = await prisma.user.findUnique({
        where: { id: String(user.userId) },
        select: { id: true, passwordHash: true }
      })

      if (!dbUser || !dbUser.passwordHash) {
        return NextResponse.json(
          { error: 'User not found or password not set.' },
          { status: 404 }
        )
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash)
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect.' },
          { status: 401 }
        )
      }

      // Check that new password is different from current
      const isSamePassword = await bcrypt.compare(newPassword, dbUser.passwordHash)
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from the current password.' },
          { status: 400 }
        )
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10)

      // Update password
      await prisma.user.update({
        where: { id: dbUser.id },
        data: { passwordHash }
      })

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully.'
      })
    } catch (error) {
      console.error('Change password error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })(request, {} as any)
}

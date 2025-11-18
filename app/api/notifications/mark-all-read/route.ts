/**
 * Mark All Notifications as Read API Route
 * PUT /api/notifications/mark-all-read - Mark all user notifications as read
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * PUT /api/notifications/mark-all-read
 * Mark all notifications as read for the authenticated user
 */
export async function PUT(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId: user.userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          count: result.count,
        },
        message: `${result.count} notification(s) marked as read`,
      })
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to mark notifications as read',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

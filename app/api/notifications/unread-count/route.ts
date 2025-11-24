/**
 * Notifications Unread Count API Route
 * GET /api/notifications/unread-count - Get unread notifications count
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications for authenticated user
 */
export const GET = withAuth(async (request, user) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: String(user.userId),
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      count,
    })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch unread count',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

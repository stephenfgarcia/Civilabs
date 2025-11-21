/**
 * Admin Bulk Notifications API
 * POST /api/admin/notifications/send - Send notifications to multiple users by role
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin } from '@/lib/auth/api-auth'

/**
 * POST /api/admin/notifications/send
 * Send notifications to multiple users based on recipient type
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()
    const { title, message, type, recipients } = body

    // Validate required fields
    if (!title || !message || !recipients) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'title, message, and recipients are required',
        },
        { status: 400 }
      )
    }

    // Build user query based on recipients
    let userQuery: any = {}

    switch (recipients) {
      case 'all':
        // No filter - send to all users
        break
      case 'instructors':
        userQuery = { role: 'INSTRUCTOR' }
        break
      case 'learners':
        userQuery = { role: 'LEARNER' }
        break
      case 'admins':
        userQuery = { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
        break
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid recipients value',
            message: 'recipients must be one of: all, instructors, learners, admins',
          },
          { status: 400 }
        )
    }

    // Get all target users
    const targetUsers = await prisma.user.findMany({
      where: userQuery,
      select: { id: true },
    })

    if (targetUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No recipients found',
          message: 'No users match the specified recipient criteria',
        },
        { status: 404 }
      )
    }

    // Create notifications for all target users
    const notifications = await prisma.notification.createMany({
      data: targetUsers.map((targetUser) => ({
        userId: targetUser.id,
        type: type || 'info',
        title,
        message,
      })),
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          sent: notifications.count,
          recipients,
        },
        message: `Successfully sent ${notifications.count} notifications to ${recipients}`,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending bulk notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

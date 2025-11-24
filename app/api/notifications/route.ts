/**
 * Notifications API Routes
 * GET /api/notifications - Get user notifications
 * POST /api/notifications - Create notification (admin/system only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withAdmin } from '@/lib/auth/api-auth'

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const notifications = await prisma.notification.findMany({
      where: {
        userId: String(user.userId),
        ...(unreadOnly && { isRead: false }),
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    })

    const unreadCount = await prisma.notification.count({
      where: {
        userId: String(user.userId),
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length,
      unreadCount,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/notifications
 * Create notification (admin only)
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.userId || !body.title || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'userId, title, and message are required',
        },
        { status: 400 }
      )
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: body.userId },
    })

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId: body.userId,
        type: body.type || 'info',
        title: body.title,
        message: body.message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: notification,
        message: 'Notification created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/notifications
 * Clear all notifications for authenticated user
 */
export const DELETE = withAuth(async (request, user) => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        userId: String(user.userId),
      },
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} notifications deleted successfully`,
      count: result.count,
    })
  } catch (error) {
    console.error('Error deleting notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

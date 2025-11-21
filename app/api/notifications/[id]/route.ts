/**
 * Notification Detail API Routes
 * PUT /api/notifications/[id] - Mark notification as read
 * DELETE /api/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * PUT /api/notifications/[id]
 * Mark notification as read
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      // Next.js 15+ requires awaiting params
      const params = await Promise.resolve(context.params)
      const { id } = params

      const notification = await prisma.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Notification not found',
          },
          { status: 404 }
        )
      }

      // Check ownership
      if (notification.userId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only update your own notifications',
          },
          { status: 403 }
        )
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedNotification,
        message: 'Notification marked as read',
      })
    } catch (error) {
      console.error('Error updating notification:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update notification',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * DELETE /api/notifications/[id]
 * Delete notification
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      // Next.js 15+ requires awaiting params
      const params = await Promise.resolve(context.params)
      const { id } = params

      const notification = await prisma.notification.findUnique({
        where: { id },
      })

      if (!notification) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Notification not found',
          },
          { status: 404 }
        )
      }

      // Check ownership
      if (notification.userId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only delete your own notifications',
          },
          { status: 403 }
        )
      }

      await prisma.notification.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Notification deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting notification:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete notification',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

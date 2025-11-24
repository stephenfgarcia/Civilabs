/**
 * Notification Preferences API Routes
 * GET /api/notifications/preferences - Get user notification preferences
 * PUT /api/notifications/preferences - Update user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/notifications/preferences
 * Get notification preferences for authenticated user
 */
export const GET = withAuth(async (request, user) => {
  try {
    // Try to get existing preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: {
        userId: String(user.userId),
      },
    })

    // If no preferences exist, create default ones
    if (!preferences) {
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: String(user.userId),
          emailNotifications: true,
          pushNotifications: true,
          courseUpdates: true,
          discussionReplies: true,
          achievements: true,
          systemAnnouncements: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: preferences,
    })
  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch notification preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/notifications/preferences
 * Update notification preferences for authenticated user
 */
export const PUT = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Validate that at least one field is being updated
    const validFields = [
      'emailNotifications',
      'pushNotifications',
      'courseUpdates',
      'discussionReplies',
      'achievements',
      'systemAnnouncements',
    ]

    const hasValidField = validFields.some(field => field in body)

    if (!hasValidField) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'At least one preference field must be provided',
        },
        { status: 400 }
      )
    }

    // Build update data with only provided fields
    const updateData: any = {}
    if (body.emailNotifications !== undefined) updateData.emailNotifications = Boolean(body.emailNotifications)
    if (body.pushNotifications !== undefined) updateData.pushNotifications = Boolean(body.pushNotifications)
    if (body.courseUpdates !== undefined) updateData.courseUpdates = Boolean(body.courseUpdates)
    if (body.discussionReplies !== undefined) updateData.discussionReplies = Boolean(body.discussionReplies)
    if (body.achievements !== undefined) updateData.achievements = Boolean(body.achievements)
    if (body.systemAnnouncements !== undefined) updateData.systemAnnouncements = Boolean(body.systemAnnouncements)

    // Upsert (update or create) preferences
    const preferences = await prisma.notificationPreference.upsert({
      where: {
        userId: String(user.userId),
      },
      update: updateData,
      create: {
        userId: String(user.userId),
        ...updateData,
      },
    })

    return NextResponse.json({
      success: true,
      data: preferences,
      message: 'Notification preferences updated successfully',
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update notification preferences',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

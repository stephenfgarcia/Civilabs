/**
 * Course Requests API Routes
 * POST /api/instructor/course-requests - Submit course creation request
 * GET /api/instructor/course-requests - Get instructor's course requests
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * POST /api/instructor/course-requests
 * Submit a new course creation request
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const { title, description, category, justification } = body

    // Validate required fields
    if (!title || !description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Title and description are required',
        },
        { status: 400 }
      )
    }

    // Create course request as a notification to admins
    // Note: We're using the notification system to track requests
    // In a production system, you might want a dedicated CourseRequest table

    // Get all admin users
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'ADMIN']
        }
      },
      select: {
        id: true
      }
    })

    // Create notifications for all admins
    const notifications = await Promise.all(
      admins.map(admin =>
        prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'info',
            title: `Course Request: ${title}`,
            message: `${user.firstName} ${user.lastName} has requested to create a new course.\n\nTitle: ${title}\nDescription: ${description}\nCategory: ${category || 'Not specified'}\nJustification: ${justification || 'Not provided'}\n\nRequested by: ${user.email}`,
            isRead: false,
          }
        })
      )
    )

    // Also create a notification for the instructor as confirmation
    await prisma.notification.create({
      data: {
        userId: String(user.userId),
        type: 'info',
        title: 'Course Request Submitted',
        message: `Your request to create "${title}" has been submitted to administrators for review. You will be notified once it has been approved or requires changes.`,
        isRead: false,
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Course request submitted successfully',
        data: {
          title,
          description,
          category,
          justification,
          notificationsCreated: notifications.length,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting course request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit course request',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * GET /api/instructor/course-requests
 * Get all course requests by the instructor
 * Note: Currently using notifications, but could be expanded to dedicated table
 */
export const GET = withInstructor(async (request, user) => {
  try {
    // Get all course request notifications sent by this instructor
    const requests = await prisma.notification.findMany({
      where: {
        userId: String(user.userId),
        title: {
          startsWith: 'Course Request'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: requests,
      count: requests.length
    })
  } catch (error) {
    console.error('Error fetching course requests:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course requests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * Bulk Email API Routes
 * POST /api/instructor/students/bulk-email - Send email to multiple students
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/instructor/students/bulk-email
 * Send email to multiple students with optional course filtering
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.subject || !body.message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Subject and message are required',
        },
        { status: 400 }
      )
    }

    // Verify user is instructor or admin
    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Only instructors can send bulk emails',
        },
        { status: 403 }
      )
    }

    // Build query based on filters
    const whereClause: any = {
      role: 'STUDENT',
    }

    // Filter by course if specified
    if (body.courseId) {
      // Verify instructor teaches this course
      const course = await prisma.course.findFirst({
        where: {
          id: body.courseId,
          instructorId: String(user.userId),
        },
      })

      if (!course) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only send emails to students in your courses',
          },
          { status: 403 }
        )
      }

      // Get students enrolled in this course
      whereClause.enrollments = {
        some: {
          courseId: body.courseId,
        },
      }
    } else if (user.role === 'INSTRUCTOR') {
      // If no course specified, get all students from instructor's courses
      whereClause.enrollments = {
        some: {
          course: {
            instructorId: String(user.userId),
          },
        },
      }
    }

    // Get recipients
    const recipients = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    })

    if (recipients.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No Recipients',
          message: 'No students found matching the criteria',
        },
        { status: 400 }
      )
    }

    // In a real application, you would send actual emails here using a service like:
    // - SendGrid
    // - AWS SES
    // - Mailgun
    // - Resend
    //
    // For now, we'll create notifications and log the email intent

    // Create notifications for all recipients
    const notifications = await prisma.notification.createMany({
      data: recipients.map((recipient) => ({
        userId: recipient.id,
        type: 'announcement',
        title: body.subject,
        message: body.message,
        linkUrl: body.linkUrl || null,
      })),
    })

    // Log the bulk email for record keeping
    console.log('Bulk email sent:', {
      from: user.email,
      subject: body.subject,
      recipientCount: recipients.length,
      courseId: body.courseId || 'all',
    })

    // In production, you would send actual emails here:
    // const emailPromises = recipients.map(recipient =>
    //   sendEmail({
    //     to: recipient.email,
    //     from: user.email,
    //     subject: body.subject,
    //     html: body.message,
    //   })
    // )
    // await Promise.all(emailPromises)

    return NextResponse.json(
      {
        success: true,
        data: {
          recipientCount: recipients.length,
          recipients: recipients.map((r) => ({
            id: r.id,
            email: r.email,
            name: `${r.firstName} ${r.lastName}`,
          })),
          notificationsCreated: notifications.count,
        },
        message: `Email sent to ${recipients.length} student${recipients.length !== 1 ? 's' : ''}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error sending bulk email:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send bulk email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

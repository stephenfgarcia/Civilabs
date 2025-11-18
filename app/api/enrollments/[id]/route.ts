/**
 * Individual Enrollment API Routes
 * GET /api/enrollments/[id] - Get enrollment details
 * DELETE /api/enrollments/[id] - Unenroll from course
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/enrollments/[id]
 * Get detailed enrollment information
 */
export const GET = withAuth(async (request, user, { params }: RouteParams) => {
  try {
    const { id } = params

    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        lessonProgress: {
          include: {
            lesson: {
              select: {
                id: true,
                title: true,
                order: true,
              },
            },
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Enrollment not found',
        },
        { status: 404 }
      )
    }

    // Check authorization - users can only view their own enrollments (unless admin)
    if (user.role !== 'admin' && enrollment.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only view your own enrollments',
        },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: enrollment,
    })
  } catch (error) {
    console.error('Error fetching enrollment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enrollment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/enrollments/[id]
 * Unenroll from a course
 */
export const DELETE = withAuth(async (request, user, { params }: RouteParams) => {
  try {
    const { id } = params

    // Get the enrollment first
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Enrollment not found',
        },
        { status: 404 }
      )
    }

    // Check authorization - users can only unenroll themselves (unless admin)
    if (user.role !== 'admin' && enrollment.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only unenroll yourself',
        },
        { status: 403 }
      )
    }

    // Prevent unenrollment if course is completed and has certificate
    if (enrollment.status === 'COMPLETED') {
      const certificate = await prisma.certificate.findFirst({
        where: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
      })

      if (certificate) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message:
              'Cannot unenroll from completed course with certificate. Contact administrator.',
          },
          { status: 409 }
        )
      }
    }

    // Delete all related lesson progress first
    await prisma.lessonProgress.deleteMany({
      where: {
        enrollmentId: id,
      },
    })

    // Delete all quiz attempts
    await prisma.quizAttempt.deleteMany({
      where: {
        enrollmentId: id,
      },
    })

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: { id },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: enrollment.userId,
        type: 'enrollment',
        title: 'Unenrolled from Course',
        message: `You have been unenrolled from ${enrollment.course.title}`,
        isRead: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully unenrolled from course',
    })
  } catch (error) {
    console.error('Error deleting enrollment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to unenroll',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

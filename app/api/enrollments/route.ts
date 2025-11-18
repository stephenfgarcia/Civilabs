/**
 * Enrollments API Routes
 * GET /api/enrollments - List enrollments
 * POST /api/enrollments - Enroll in course
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, authenticateRequest, requireApiRole } from '@/lib/auth/api-auth'

/**
 * GET /api/enrollments
 * List enrollments (own enrollments for learners, all for admin)
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    // Learners can only see their own enrollments
    // Admins and instructors can see all enrollments (with filters)
    const isAdmin = user.role === 'admin' || user.role === 'instructor'
    const targetUserId = isAdmin && userId ? userId : user.userId

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: targetUserId,
        ...(courseId && { courseId }),
        ...(status && { status }),
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            _count: {
              select: {
                modules: true,
              },
            },
          },
        },
        completedLessons: {
          select: {
            id: true,
            lessonId: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    })

    // Enrich with progress information
    const enrichedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        // Count total lessons in course
        const totalLessons = await prisma.lesson.count({
          where: {
            module: {
              courseId: enrollment.courseId,
            },
          },
        })

        const completedCount = enrollment.completedLessons.length
        const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

        return {
          ...enrollment,
          totalLessons,
          completedLessonsCount: completedCount,
          progress,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedEnrollments,
      count: enrichedEnrollments.length,
    })
  } catch (error) {
    console.error('Error fetching enrollments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch enrollments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/enrollments
 * Enroll user in a course
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { courseId } = body

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Course ID is required',
        },
        { status: 400 }
      )
    }

    // Check if course exists and is published
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Course not found',
        },
        { status: 404 }
      )
    }

    if (!course.published) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Cannot enroll in unpublished course',
        },
        { status: 403 }
      )
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.userId,
        courseId,
      },
    })

    if (existingEnrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Already enrolled in this course',
        },
        { status: 409 }
      )
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: user.userId,
        courseId,
        status: 'active',
        progress: 0,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: user.userId,
        type: 'enrollment',
        title: 'Enrollment Successful',
        message: `You have successfully enrolled in ${course.title}`,
        read: false,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in course',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating enrollment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enroll',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

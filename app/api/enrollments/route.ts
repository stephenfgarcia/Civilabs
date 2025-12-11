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

    console.log('[Enrollments API] User from token:', { userId: user.userId, role: user.role, email: user.email })

    // Learners can only see their own enrollments
    // Admins and instructors can see all enrollments (with filters)
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'INSTRUCTOR'

    // Build where clause
    const where: any = {
      ...(courseId && { courseId }),
      ...(status && { status: status as any }),
    }

    // If not admin OR admin specifically filtered by userId, add userId filter
    if (!isAdmin || userId) {
      where.userId = userId || String(user.userId)
    }

    console.log('[Enrollments API] Where clause:', where)

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
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
                lessons: true,
              },
            },
          },
        },
        lessonProgress: {
          where: {
            status: 'COMPLETED',
          },
          select: {
            id: true,
            lessonId: true,
          },
        },
        _count: {
          select: {
            quizAttempts: true,
            userCertificates: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    })

    console.log('[Enrollments API] Found enrollments:', enrollments.length)

    // Enrich with progress information (optimized to avoid N+1 query)
    // Step 1: Get all unique course IDs
    const courseIds = [...new Set(enrollments.map(e => e.courseId))]

    // Step 2: Single query to get lesson counts for all courses
    const lessonCounts = await prisma.lesson.groupBy({
      by: ['courseId'],
      where: { courseId: { in: courseIds } },
      _count: { id: true },
    })

    // Step 3: Create lookup map for O(1) access
    const lessonCountMap = Object.fromEntries(
      lessonCounts.map(lc => [lc.courseId, lc._count.id])
    )

    // Step 4: Enrich enrollments without additional queries
    const enrichedEnrollments = enrollments.map((enrollment) => {
      const totalLessons = lessonCountMap[enrollment.courseId] || 0
      const completedCount = enrollment.lessonProgress.length
      const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

      return {
        ...enrollment,
        totalLessons,
        completedLessonsCount: completedCount,
        calculatedProgress: progress,
      }
    })

    console.log('[Enrollments API] Returning enriched enrollments:', enrichedEnrollments.length)

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

    // Check if course is published (uses publishedAt field, not status)
    if (!course.publishedAt) {
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
        userId: String(user.userId),
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
        userId: String(user.userId),
        courseId,
        status: 'ENROLLED',
        progressPercentage: 0,
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
        userId: String(user.userId),
        type: 'enrollment',
        title: 'Enrollment Successful',
        message: `You have successfully enrolled in ${course.title}`,
        isRead: false,
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

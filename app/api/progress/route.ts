/**
 * Progress Tracking API Routes
 * GET /api/progress - Get lesson progress for user
 * POST /api/progress - Create/update lesson progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import NotificationTriggers from '@/lib/utils/notification-triggers'

/**
 * GET /api/progress
 * Get lesson progress for authenticated user or specific enrollment
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const enrollmentId = searchParams.get('enrollmentId')
    const lessonId = searchParams.get('lessonId')
    const courseId = searchParams.get('courseId')

    const where: any = {
      userId: user.userId,
    }

    if (enrollmentId) {
      where.enrollmentId = enrollmentId
    }

    if (lessonId) {
      where.lessonId = lessonId
    }

    if (courseId) {
      where.lesson = { courseId }
    }

    const progress = await prisma.lessonProgress.findMany({
      where,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            contentType: true,
            durationMinutes: true,
            order: true,
            courseId: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
        enrollment: {
          select: {
            id: true,
            courseId: true,
            status: true,
            progressPercentage: true,
          },
        },
      },
      orderBy: [
        { lesson: { order: 'asc' } },
      ],
    })

    return NextResponse.json({
      success: true,
      data: progress,
      count: progress.length,
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/progress
 * Create or update lesson progress
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const {
      enrollmentId,
      lessonId,
      status,
      timeSpentSeconds,
      lastPosition,
    } = body

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'enrollmentId and lessonId are required',
        },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          select: {
            _count: {
              select: { lessons: true },
            },
          },
        },
      },
    })

    if (!enrollment || enrollment.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Invalid enrollment',
        },
        { status: 403 }
      )
    }

    // Find or create progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
    })

    const now = new Date()
    let progress

    if (existingProgress) {
      // Update existing progress
      progress = await prisma.lessonProgress.update({
        where: { id: existingProgress.id },
        data: {
          status: status || existingProgress.status,
          timeSpentSeconds: timeSpentSeconds !== undefined
            ? existingProgress.timeSpentSeconds + timeSpentSeconds
            : existingProgress.timeSpentSeconds,
          lastPosition: lastPosition !== undefined ? lastPosition : existingProgress.lastPosition,
          startedAt: existingProgress.startedAt || (status === 'IN_PROGRESS' ? now : null),
          completedAt: status === 'COMPLETED' ? now : existingProgress.completedAt,
          attempts: existingProgress.attempts + 1,
          updatedAt: now,
        },
        include: {
          lesson: true,
        },
      })
    } else {
      // Create new progress
      progress = await prisma.lessonProgress.create({
        data: {
          userId: user.userId,
          enrollmentId,
          lessonId,
          status: status || 'IN_PROGRESS',
          timeSpentSeconds: timeSpentSeconds || 0,
          lastPosition,
          startedAt: status === 'IN_PROGRESS' ? now : null,
          completedAt: status === 'COMPLETED' ? now : null,
          attempts: 1,
        },
        include: {
          lesson: true,
        },
      })
    }

    // Update enrollment progress percentage
    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId,
        status: 'COMPLETED',
      },
    })

    const totalLessons = enrollment.course._count.lessons
    const progressPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    // Update enrollment status and progress
    let enrollmentStatus = enrollment.status
    if (progressPercentage === 100 && enrollmentStatus !== 'COMPLETED') {
      enrollmentStatus = 'COMPLETED'
    } else if (progressPercentage > 0 && enrollmentStatus === 'ENROLLED') {
      enrollmentStatus = 'IN_PROGRESS'
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progressPercentage,
        status: enrollmentStatus,
        startedAt: enrollment.startedAt || now,
        completedAt: enrollmentStatus === 'COMPLETED' ? now : null,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    })

    // Trigger notifications for lesson completion
    if (status === 'COMPLETED' && !existingProgress?.completedAt) {
      await NotificationTriggers.onLessonCompletion(
        user.userId,
        progress.lesson.title,
        progress.lesson.courseId
      )
    }

    // Trigger notification for course completion
    if (enrollmentStatus === 'COMPLETED' && enrollment.status !== 'COMPLETED') {
      await NotificationTriggers.onCourseCompletion(
        user.userId,
        updatedEnrollment.course.title,
        enrollment.courseId
      )
    }

    return NextResponse.json({
      success: true,
      data: progress,
      enrollment: {
        progressPercentage,
        status: enrollmentStatus,
        completedLessons,
        totalLessons,
      },
      message: 'Progress updated successfully',
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

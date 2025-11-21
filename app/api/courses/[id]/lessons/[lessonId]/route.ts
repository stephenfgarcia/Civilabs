/**
 * Lesson Detail API Routes
 * GET /api/courses/[courseId]/lessons/[lessonId] - Get lesson details with progress
 * POST /api/courses/[courseId]/lessons/[lessonId]/complete - Mark lesson as complete
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/courses/[id]/lessons/[lessonId]
 * Get lesson details with user progress
 */
export const GET = withAuth(async (request, user, context?: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const params = await context!.params
    const { id: courseId, lessonId } = params

    // Check if user is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: String(user.userId),
        courseId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You must be enrolled in this course to view lessons',
        },
        { status: 403 }
      )
    }

    // Fetch lesson with quiz if it has one
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found',
        },
        { status: 404 }
      )
    }

    // Verify lesson belongs to the course
    if (lesson.courseId !== courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found in this course',
        },
        { status: 404 }
      )
    }

    // Get user's progress for this lesson
    const progress = await prisma.lessonProgress.findFirst({
      where: {
        enrollmentId: enrollment.id,
        lessonId,
        userId: String(user.userId),
      },
    })

    // Get all lessons in the course for navigation
    const allLessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
      },
    })

    // Find current lesson index and next/previous lessons
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
    const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
    const nextLesson =
      currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

    return NextResponse.json({
      success: true,
      data: {
        lesson,
        progress: progress || null,
        isCompleted: progress?.status === 'COMPLETED',
        navigation: {
          previous: previousLesson,
          next: nextLesson,
          current: currentIndex + 1,
          total: allLessons.length,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/courses/[id]/lessons/[lessonId]/complete
 * Mark lesson as complete and update progress
 */
export const POST = withAuth(async (request, user, context?: { params: Promise<{ id: string; lessonId: string }> }) => {
  try {
    const params = await context!.params
    const { id: courseId, lessonId } = params
    const body = await request.json()
    const { timeSpentSeconds } = body

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: String(user.userId),
        courseId,
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You must be enrolled in this course',
        },
        { status: 403 }
      )
    }

    // Verify lesson exists and belongs to course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        courseId,
      },
    })

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found',
        },
        { status: 404 }
      )
    }

    // Create or update lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        userId: String(user.userId),
        status: 'COMPLETED',
        timeSpentSeconds: timeSpentSeconds || (lesson.durationMinutes ? lesson.durationMinutes * 60 : 0),
        completedAt: new Date(),
      },
      update: {
        status: 'COMPLETED',
        timeSpentSeconds: timeSpentSeconds || undefined,
        completedAt: new Date(),
      },
    })

    // Update enrollment progress percentage
    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    })

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        status: 'COMPLETED',
      },
    })

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage,
        ...(progressPercentage === 100 && {
          completedAt: new Date(),
          status: 'COMPLETED',
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        progress,
        enrollmentProgress: progressPercentage,
      },
      message: 'Lesson marked as complete',
    })
  } catch (error) {
    console.error('Error completing lesson:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete lesson',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

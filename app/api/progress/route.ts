/**
 * Progress Tracking API Routes
 * POST /api/progress - Mark lesson as complete
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/progress
 * Mark a lesson as complete and update course progress
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { enrollmentId, lessonId } = body

    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Enrollment ID and Lesson ID are required',
        },
        { status: 400 }
      )
    }

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
        completedLessons: true,
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

    if (enrollment.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only update your own progress',
        },
        { status: 403 }
      )
    }

    // Verify lesson exists in the course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          courseId: enrollment.courseId,
        },
      },
    })

    if (!lesson) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Lesson not found in this course',
        },
        { status: 404 }
      )
    }

    // Check if already completed
    const alreadyCompleted = await prisma.lessonProgress.findFirst({
      where: {
        enrollmentId,
        lessonId,
      },
    })

    if (alreadyCompleted) {
      return NextResponse.json(
        {
          success: true,
          data: alreadyCompleted,
          message: 'Lesson already marked as complete',
        },
        { status: 200 }
      )
    }

    // Mark lesson as complete
    const lessonProgress = await prisma.lessonProgress.create({
      data: {
        enrollmentId,
        lessonId,
        completedAt: new Date(),
      },
    })

    // Calculate total lessons in course
    const totalLessons = enrollment.course.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    )

    // Calculate completed lessons
    const completedLessons = enrollment.completedLessons.length + 1

    // Calculate new progress percentage
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100)

    // Update enrollment progress
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        progress: progressPercentage,
        ...(progressPercentage === 100 && { status: 'completed', completedAt: new Date() }),
      },
    })

    // Award points for lesson completion
    await prisma.user.update({
      where: { id: user.userId },
      data: {
        points: {
          increment: 10, // 10 points per lesson
        },
      },
    })

    // If course is completed, issue certificate
    if (progressPercentage === 100) {
      // Check if certificate already exists
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          userId: user.userId,
          courseId: enrollment.courseId,
        },
      })

      if (!existingCertificate) {
        await prisma.certificate.create({
          data: {
            userId: user.userId,
            courseId: enrollment.courseId,
            enrollmentId: enrollment.id,
            issuedAt: new Date(),
          },
        })

        // Create notification for certificate
        await prisma.notification.create({
          data: {
            userId: user.userId,
            type: 'achievement',
            title: 'Certificate Earned!',
            message: `Congratulations! You've earned a certificate for ${enrollment.course.title}`,
            read: false,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        lessonProgress,
        enrollment: updatedEnrollment,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: progressPercentage,
        },
      },
      message: progressPercentage === 100 ? 'Course completed! Certificate issued.' : 'Lesson marked as complete',
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

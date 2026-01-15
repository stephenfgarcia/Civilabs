/**
 * Instructor Analytics API Routes
 * GET /api/instructor/analytics - Get detailed analytics for instructor's courses
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withRole } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/analytics
 * Get comprehensive analytics for instructor's courses
 */
export const GET = withRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'], async (request, user) => {
  try {
    const instructorId = user.userId
    const { searchParams } = new URL(request.url)

    const courseId = searchParams.get('courseId')
    const period = searchParams.get('period') || '30' // days

    // Calculate date range
    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // Build where clause
    const courseWhere: any = {
      instructorId,
    }

    if (courseId) {
      courseWhere.id = courseId
    }

    // Get courses with detailed data
    const courses = await prisma.course.findMany({
      where: courseWhere,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            lessonProgress: {
              select: {
                lessonId: true,
                status: true,
                timeSpentSeconds: true,
                completedAt: true,
              },
            },
          },
        },
        lessons: {
          select: {
            id: true,
            title: true,
            order: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    })

    // Calculate enrollment trends
    const enrollmentsByDate: { [key: string]: number } = {}
    const completionsByDate: { [key: string]: number } = {}

    courses.forEach(course => {
      course.enrollments.forEach(enrollment => {
        const enrollDate = enrollment.enrolledAt.toISOString().split('T')[0]
        enrollmentsByDate[enrollDate] = (enrollmentsByDate[enrollDate] || 0) + 1

        if (enrollment.completedAt) {
          const completeDate = enrollment.completedAt.toISOString().split('T')[0]
          completionsByDate[completeDate] = (completionsByDate[completeDate] || 0) + 1
        }
      })
    })

    // Sort dates and create time series
    const sortedDates = Object.keys({
      ...enrollmentsByDate,
      ...completionsByDate,
    }).sort()

    const enrollmentTrend = sortedDates.map(date => ({
      date,
      enrollments: enrollmentsByDate[date] || 0,
      completions: completionsByDate[date] || 0,
    }))

    // Calculate course performance metrics
    const courseMetrics = courses.map(course => {
      const totalEnrollments = course.enrollments.length
      const completedEnrollments = course.enrollments.filter(
        e => e.status === 'COMPLETED'
      ).length
      const activeEnrollments = course.enrollments.filter(
        e => e.status === 'ENROLLED' || e.status === 'IN_PROGRESS'
      ).length

      // Calculate average time spent
      const totalTimeSpent = course.enrollments.reduce((sum, enrollment) => {
        return (
          sum +
          enrollment.lessonProgress.reduce((lessonSum, progress) => {
            return lessonSum + (progress.timeSpentSeconds || 0)
          }, 0)
        )
      }, 0)

      const avgTimeSpentHours =
        totalEnrollments > 0 ? Math.round(totalTimeSpent / totalEnrollments / 3600) : 0

      // Calculate lesson completion rates - fixed to check specific lesson completion
      const lessonCompletionRates = course.lessons.map(lesson => {
        const completedCount = course.enrollments.reduce((count, enrollment) => {
          // Find progress for THIS specific lesson, not just any completed lesson
          const lessonProgress = enrollment.lessonProgress.find(
            p => p.lessonId === lesson.id && p.status === 'COMPLETED'
          )
          return lessonProgress ? count + 1 : count
        }, 0)

        return {
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          completionRate:
            totalEnrollments > 0
              ? Math.round((completedCount / totalEnrollments) * 100)
              : 0,
        }
      })

      return {
        courseId: course.id,
        courseTitle: course.title,
        category: course.category?.name,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        completionRate:
          totalEnrollments > 0
            ? Math.round((completedEnrollments / totalEnrollments) * 100)
            : 0,
        avgTimeSpentHours,
        totalLessons: course._count.lessons,
        lessonCompletionRates,
      }
    })

    // Calculate overall statistics
    const totalEnrollments = courses.reduce(
      (sum, c) => sum + c._count.enrollments,
      0
    )
    const totalCompletions = courses.reduce(
      (sum, c) => sum + c.enrollments.filter(e => e.status === 'COMPLETED').length,
      0
    )
    const overallCompletionRate =
      totalEnrollments > 0
        ? Math.round((totalCompletions / totalEnrollments) * 100)
        : 0

    // Get student engagement metrics
    const uniqueStudents = new Set(
      courses.flatMap(c => c.enrollments.map(e => e.user.id))
    ).size

    // Calculate retention (students who have completed at least one course)
    const studentsWithCompletions = new Set(
      courses.flatMap(c =>
        c.enrollments
          .filter(e => e.status === 'COMPLETED')
          .map(e => e.user.id)
      )
    ).size

    const retentionRate =
      uniqueStudents > 0
        ? Math.round((studentsWithCompletions / uniqueStudents) * 100)
        : 0

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalCourses: courses.length,
          totalEnrollments,
          totalCompletions,
          overallCompletionRate,
          uniqueStudents,
          retentionRate,
        },
        enrollmentTrend,
        courseMetrics,
        period: {
          days: periodDays,
          startDate: startDate.toISOString(),
          endDate: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    console.error('Error fetching instructor analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch instructor analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

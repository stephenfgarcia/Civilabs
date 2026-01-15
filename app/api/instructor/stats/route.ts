/**
 * Instructor Statistics API Routes
 * GET /api/instructor/stats - Get instructor dashboard statistics
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withRole } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/stats
 * Get statistics for instructor dashboard
 */
export const GET = withRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'], async (request, user) => {
  try {
    const instructorId = String(user.userId)

    // Get instructor's courses with reviews
    const courses = await prisma.course.findMany({
      where: {
        instructorId,
        status: 'PUBLISHED',
      },
      include: {
        enrollments: {
          include: {
            user: true,
          },
        },
        reviews: {
          select: {
            rating: true,
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

    // Calculate statistics
    const activeCourses = courses.length

    const totalStudents = courses.reduce((sum, course) => sum + course._count.enrollments, 0)

    // Get unique students across all courses
    const uniqueStudentIds = new Set(
      courses.flatMap(course => course.enrollments.map(e => e.userId))
    )
    const uniqueStudents = uniqueStudentIds.size

    // Calculate average rating from actual reviews
    const allReviews = courses.flatMap(course => course.reviews)
    const avgRating = allReviews.length > 0
      ? Math.round((allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length) * 10) / 10
      : 0

    // Calculate completion rate
    const completedEnrollments = courses.reduce(
      (sum, course) =>
        sum + course.enrollments.filter(e => e.status === 'COMPLETED').length,
      0
    )
    const totalEnrollments = courses.reduce((sum, course) => sum + course.enrollments.length, 0)
    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0

    // Get recent activity (last 10 enrollments)
    const recentEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
      take: 10,
    })

    // Get pending tasks - count actual submissions needing grading and discussions needing response
    const courseIds = courses.map(c => c.id)

    // Count assignments with submitted but ungraded submissions
    const assignmentsToGrade = await prisma.assignmentSubmission.count({
      where: {
        assignment: {
          courseId: { in: courseIds },
          instructorId,
        },
        status: 'SUBMITTED',
        grade: null,
      },
    })

    // Count discussions in instructor's courses that need responses (threads with no replies)
    const discussionsToRespond = await prisma.discussionThread.count({
      where: {
        courseId: { in: courseIds },
        isLocked: false,
        isSolved: false,
        replies: {
          none: {},
        },
      },
    })

    // Count quiz attempts that may need manual review
    // These are quizzes with essay or short answer questions where the score might need instructor review
    const quizzesWithManualReview = await prisma.quizAttempt.count({
      where: {
        enrollment: {
          course: {
            instructorId,
          },
        },
        completedAt: { not: null },
        quiz: {
          questions: {
            some: {
              questionType: {
                in: ['ESSAY', 'SHORT_ANSWER'],
              },
            },
          },
        },
        // Only count recent attempts (last 7 days) that haven't been reviewed
        // For now, we consider completed attempts as potentially needing review
        startedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    const pendingTasks = {
      assignmentsToGrade,
      discussionsToRespond,
      quizzesToReview: quizzesWithManualReview,
    }

    // Get top performing courses with their individual ratings
    const topCourses = courses
      .map(course => {
        // Calculate course-specific rating
        const courseRating = course.reviews.length > 0
          ? Math.round((course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length) * 10) / 10
          : 0

        return {
          id: course.id,
          title: course.title,
          students: course._count.enrollments,
          lessons: course._count.lessons,
          rating: courseRating, // Course-specific rating instead of using avgRating
          completionRate: course.enrollments.length > 0
            ? Math.round(
                (course.enrollments.filter(e => e.status === 'COMPLETED').length /
                  course.enrollments.length) * 100
              )
            : 0,
        }
      })
      .sort((a, b) => b.students - a.students)
      .slice(0, 5)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeCourses,
          totalStudents,
          uniqueStudents,
          avgRating,
          completionRate,
        },
        recentActivity: recentEnrollments.map(enrollment => ({
          id: enrollment.id,
          type: 'enrollment',
          student: {
            id: enrollment.user.id,
            name: `${enrollment.user.firstName} ${enrollment.user.lastName}`,
            email: enrollment.user.email,
          },
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
          },
          status: enrollment.status,
          enrolledAt: enrollment.enrolledAt,
        })),
        pendingTasks,
        topCourses,
      },
    })
  } catch (error) {
    console.error('Error fetching instructor stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch instructor statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

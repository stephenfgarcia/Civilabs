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
    const instructorId = user.userId

    // Get instructor's courses
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

    // Calculate average rating (placeholder - implement when review system is ready)
    const avgRating = 4.8

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

    // Get pending tasks (assignments to grade, discussions to respond to, etc.)
    // This is a placeholder - implement when assignment system is ready
    const pendingTasks = {
      assignmentsToGrade: 0,
      discussionsToRespond: 0,
      quizzesToReview: 0,
    }

    // Get top performing courses
    const topCourses = courses
      .map(course => ({
        id: course.id,
        title: course.title,
        students: course._count.enrollments,
        lessons: course._count.lessons,
        completionRate: course.enrollments.length > 0
          ? Math.round(
              (course.enrollments.filter(e => e.status === 'COMPLETED').length /
                course.enrollments.length) * 100
            )
          : 0,
      }))
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

/**
 * Student Profile API Routes
 * GET /api/instructor/students/[id] - Get detailed student profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/students/[id]
 * Get detailed student profile with enrollments, progress, and activity
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Verify user is instructor
      if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'Only instructors can view student profiles',
          },
          { status: 403 }
        )
      }

      // Get student basic info
      const student = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      if (!student) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Student not found',
          },
          { status: 404 }
        )
      }

      // Get enrollments with progress
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              thumbnail: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
      })

      // Get course progress for each enrollment
      const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const lessonsCount = await prisma.lesson.count({
            where: { courseId: enrollment.courseId },
          })

          const completedLessons = await prisma.lessonProgress.count({
            where: {
              userId: id,
              lesson: { courseId: enrollment.courseId },
              completedAt: { not: null },
            },
          })

          const progress = lessonsCount > 0 ? Math.round((completedLessons / lessonsCount) * 100) : 0

          return {
            ...enrollment,
            lessonsCount,
            completedLessons,
            progress,
          }
        })
      )

      // Get quiz attempts with scores
      const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId: id },
        include: {
          quiz: {
            select: {
              title: true,
              lesson: {
                select: {
                  title: true,
                  course: {
                    select: {
                      title: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      })

      // Get certificates
      const userCertificates = await prisma.userCertificate.findMany({
        where: { userId: id },
        include: {
          certificate: {
            include: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
        orderBy: { issuedAt: 'desc' },
      })

      // Get recent activity (discussions, reviews)
      const discussions = await prisma.discussionThread.findMany({
        where: { userId: id },
        select: {
          id: true,
          title: true,
          createdAt: true,
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      const reviews = await prisma.courseReview.findMany({
        where: { userId: id },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          course: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })

      // Calculate stats
      const totalEnrollments = enrollments.length
      const completedCourses = enrollments.filter((e) => e.status === 'COMPLETED').length
      const avgProgress =
        enrollmentsWithProgress.length > 0
          ? Math.round(
              enrollmentsWithProgress.reduce((sum, e) => sum + e.progress, 0) /
                enrollmentsWithProgress.length
            )
          : 0

      const avgQuizScore =
        quizAttempts.length > 0
          ? Math.round(
              quizAttempts.reduce((sum, a) => sum + (a.scorePercentage || 0), 0) / quizAttempts.length
            )
          : 0

      return NextResponse.json({
        success: true,
        data: {
          student,
          enrollments: enrollmentsWithProgress,
          quizAttempts,
          certificates: userCertificates.map((uc) => ({
            id: uc.id,
            issuedAt: uc.issuedAt,
            certificateUrl: uc.certificateUrl || '',
            course: {
              title: uc.certificate.course.title,
            },
          })),
          recentActivity: {
            discussions,
            reviews,
          },
          stats: {
            totalEnrollments,
            completedCourses,
            avgProgress,
            avgQuizScore,
            totalCertificates: userCertificates.length,
          },
        },
      })
    } catch (error) {
      console.error('Error fetching student profile:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch student profile',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

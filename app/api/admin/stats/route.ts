/**
 * Admin Stats API Routes
 * GET /api/admin/stats - Get admin dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin } from '@/lib/auth/api-auth'

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics (admin only)
 */
export const GET = withAdmin(async (request, user) => {
  try {
      // Get total users count
      const totalUsers = await prisma.user.count()

      // Get users by role
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      })

      // Get total courses count
      const totalCourses = await prisma.course.count()

      // Get published courses count
      const publishedCourses = await prisma.course.count({
        where: {
          publishedAt: {
            not: null,
          },
        },
      })

      // Get total enrollments count
      const totalEnrollments = await prisma.enrollment.count()

      // Get active enrollments (in progress)
      const activeEnrollments = await prisma.enrollment.count({
        where: { status: 'ENROLLED' },
      })

      // Get completed enrollments
      const completedEnrollments = await prisma.enrollment.count({
        where: { status: 'COMPLETED' },
      })

      // Get total certificates issued
      const totalCertificates = await prisma.certificate.count()

      // Calculate completion rate
      const completionRate = totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0

      // Get recent enrollments (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentEnrollments = await prisma.enrollment.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      })

      // Get recent activity (last 10 activities)
      const recentActivity = await prisma.enrollment.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
        },
      })

      // Get popular courses (by enrollment count)
      const popularCourses = await prisma.course.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          enrollments: {
            _count: 'desc',
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalCourses,
            publishedCourses,
            totalEnrollments,
            activeEnrollments,
            completedEnrollments,
            totalCertificates,
            completionRate,
            recentEnrollments,
          },
          usersByRole: usersByRole.reduce((acc, curr) => {
            acc[curr.role] = curr._count.id
            return acc
          }, {} as Record<string, number>),
          recentActivity: recentActivity.map(activity => ({
            id: activity.id,
            type: 'enrollment',
            userName: `${activity.user.firstName} ${activity.user.lastName}`,
            userEmail: activity.user.email,
            courseName: activity.course.title,
            status: activity.status,
            createdAt: activity.createdAt,
          })),
          popularCourses: popularCourses.map(course => ({
            id: course.id,
            title: course.title,
            enrollmentCount: course._count.enrollments,
            category: course.category,
          })),
        },
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch admin statistics',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
})

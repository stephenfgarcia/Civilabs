/**
 * Instructor Courses API Routes
 * GET /api/instructor/courses - Get courses taught by the instructor
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withRole } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/courses
 * Get all courses taught by the authenticated instructor
 */
export const GET = withRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'], async (request, user) => {
  try {
    const instructorId = user.userId
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') // DRAFT, PUBLISHED, ARCHIVED
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      instructorId,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
        enrollments: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate additional metrics for each course
    const coursesWithMetrics = courses.map(course => {
      const totalEnrollments = course._count.enrollments
      const completedEnrollments = course.enrollments.filter(
        e => e.status === 'COMPLETED'
      ).length
      const activeEnrollments = course.enrollments.filter(
        e => e.status === 'ENROLLED' || e.status === 'IN_PROGRESS'
      ).length

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        status: course.status,
        visibility: course.visibility,
        difficultyLevel: course.difficultyLevel,
        durationMinutes: course.durationMinutes,
        thumbnailUrl: course.thumbnail, // Map to correct field name
        publishedAt: course.publishedAt,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        category: course.category,
        instructor: course.instructor,
        metrics: {
          totalEnrollments,
          activeEnrollments,
          completedEnrollments,
          completionRate:
            totalEnrollments > 0
              ? Math.round((completedEnrollments / totalEnrollments) * 100)
              : 0,
          totalLessons: course._count.lessons,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        courses: coursesWithMetrics,
        total: coursesWithMetrics.length,
      },
    })
  } catch (error) {
    console.error('Error fetching instructor courses:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch instructor courses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

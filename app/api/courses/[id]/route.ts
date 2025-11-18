/**
 * Course Detail API Routes
 * GET /api/courses/[id] - Get course details
 * PUT /api/courses/[id] - Update course (admin/instructor only)
 * DELETE /api/courses/[id] - Delete course (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor, withAdmin, authenticateRequest } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/courses/[id]
 * Get detailed course information including modules and lessons
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const params = await context.params
    const { id } = params
    const user = authenticateRequest(request)

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        lessons: {
          orderBy: {
            order: 'asc',
          },
          include: {
            quiz: {
              select: {
                id: true,
                title: true,
                description: true,
                passingScore: true,
                timeLimitMinutes: true,
                _count: {
                  select: {
                    questions: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
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

    // Check if user is enrolled (if authenticated)
    let enrollment = null
    if (user) {
      enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: user.userId,
          courseId: id,
        },
        include: {
          lessonProgress: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              lessonId: true,
            },
          },
        },
      })
    }

    // Calculate average rating
    const reviews = await prisma.review.aggregate({
      where: { courseId: id },
      _avg: {
        rating: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        averageRating: reviews._avg.rating || 0,
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/courses/[id]
 * Update course (instructor/admin only)
 * Instructors can only update their own courses
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  return withInstructor(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()

      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id },
      })

      if (!existingCourse) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Course not found',
          },
          { status: 404 }
        )
      }

      // Check ownership (instructors can only edit their own courses)
      if (user.role !== 'admin' && existingCourse.instructorId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only edit your own courses',
          },
          { status: 403 }
        )
      }

      const course = await prisma.course.update({
        where: { id },
        data: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.category && { category: body.category }),
          ...(body.difficulty && { difficulty: body.difficulty }),
          ...(body.duration !== undefined && { duration: body.duration }),
          ...(body.price !== undefined && { price: body.price }),
          ...(body.thumbnail && { thumbnail: body.thumbnail }),
          ...(body.published !== undefined && { published: body.published }),
          ...(body.objectives && { objectives: body.objectives }),
          ...(body.prerequisites && { prerequisites: body.prerequisites }),
          ...(body.tags && { tags: body.tags }),
        },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: course,
        message: 'Course updated successfully',
      })
    } catch (error) {
      console.error('Error updating course:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update course',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

/**
 * DELETE /api/courses/[id]
 * Delete course (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              enrollments: true,
            },
          },
        },
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

      // Prevent deletion if course has enrollments
      if (course._count.enrollments > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Cannot delete course with active enrollments. Archive it instead.',
          },
          { status: 409 }
        )
      }

      await prisma.course.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Course deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting course:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete course',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

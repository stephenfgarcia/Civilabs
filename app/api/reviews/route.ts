/**
 * Course Reviews API Routes
 * GET /api/reviews - List reviews for a course
 * POST /api/reviews - Create a review
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/reviews
 * List reviews for a course with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const rating = searchParams.get('rating')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'courseId is required',
        },
        { status: 400 }
      )
    }

    const reviews = await prisma.courseReview.findMany({
      where: {
        courseId,
        ...(rating && { rating: parseInt(rating) }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const totalCount = await prisma.courseReview.count({
      where: {
        courseId,
        ...(rating && { rating: parseInt(rating) }),
      },
    })

    // Calculate average rating
    const averageRating = await prisma.courseReview.aggregate({
      where: { courseId },
      _avg: {
        rating: true,
      },
    })

    // Count reviews by rating
    const ratingDistribution = await prisma.courseReview.groupBy({
      by: ['rating'],
      where: { courseId },
      _count: {
        rating: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length,
      total: totalCount,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution: ratingDistribution.reduce((acc, curr) => {
        acc[curr.rating] = curr._count.rating
        return acc
      }, {} as Record<number, number>),
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews
 * Create a review for a course (requires course completion)
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.courseId || !body.rating) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'courseId and rating are required',
        },
        { status: 400 }
      )
    }

    // Validate rating range
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Rating must be between 1 and 5',
        },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
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

    // Check if user has completed the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: String(user.userId),
        courseId: body.courseId,
        status: 'COMPLETED',
      },
    })

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You must complete the course before reviewing it',
        },
        { status: 403 }
      )
    }

    // Check if user has already reviewed this course
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId: {
          userId: String(user.userId),
          courseId: body.courseId,
        },
      },
    })

    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.courseReview.update({
        where: { id: existingReview.id },
        data: {
          rating: body.rating,
          comment: body.comment || null,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedReview,
        message: 'Review updated successfully',
      })
    }

    // Create new review
    const review = await prisma.courseReview.create({
      data: {
        courseId: body.courseId,
        userId: String(user.userId),
        rating: body.rating,
        comment: body.comment || null,
        isVerified: true, // Verified because user completed course
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    })

    // Create notification for course instructor
    await prisma.notification.create({
      data: {
        userId: course.instructorId,
        type: 'review',
        title: 'New course review',
        message: `${user.firstName} ${user.lastName} left a ${body.rating}-star review on "${course.title}"`,
        linkUrl: `/courses/${body.courseId}`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: review,
        message: 'Review created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create review',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

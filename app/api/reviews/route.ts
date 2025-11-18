import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

// GET /api/reviews?courseId=xxx - List reviews for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.courseReview.findMany({
      where: { courseId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: reviews,
      count: reviews.length
    })
  } catch (error) {
    console.error('Fetch reviews error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

// POST /api/reviews - Create a review
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()
    const { courseId, rating, comment } = body

    // Validate
    if (!courseId || !rating) {
      return NextResponse.json(
        { success: false, error: 'courseId and rating are required' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user has completed the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.userId,
        courseId,
        status: 'COMPLETED'
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'You must complete the course before reviewing' },
        { status: 403 }
      )
    }

    // Check if already reviewed
    const existingReview = await prisma.courseReview.findFirst({
      where: { userId: user.userId, courseId }
    })

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this course' },
        { status: 409 }
      )
    }

    // Create review
    const review = await prisma.courseReview.create({
      data: {
        userId: user.userId,
        courseId,
        rating,
        comment
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
})

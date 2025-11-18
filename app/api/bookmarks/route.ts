/**
 * Bookmarks API Routes
 * GET /api/bookmarks - List user's bookmarked courses
 * POST /api/bookmarks - Add a course to bookmarks
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/bookmarks
 * List all bookmarked courses for the authenticated user
 */
export const GET = withAuth(async (request, user) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: user.userId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            _count: {
              select: {
                enrollments: true,
                lessons: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: bookmarks,
      count: bookmarks.length,
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookmarks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/bookmarks
 * Add a course to user's bookmarks
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Course ID is required',
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

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_courseId: {
          userId: user.userId,
          courseId: body.courseId,
        },
      },
    })

    if (existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Course is already bookmarked',
        },
        { status: 409 }
      )
    }

    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.userId,
        courseId: body.courseId,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: bookmark,
        message: 'Course bookmarked successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating bookmark:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bookmark',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

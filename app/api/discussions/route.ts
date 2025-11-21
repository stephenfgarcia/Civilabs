/**
 * Discussions API Routes
 * GET /api/discussions - List all discussions
 * POST /api/discussions - Create new discussion (authenticated users)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/discussions
 * List discussions with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    const discussions = await prisma.discussionThread.findMany({
      where: {
        ...(courseId && { courseId }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    })

    const totalCount = await prisma.discussionThread.count({
      where: {
        ...(courseId && { courseId }),
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: discussions,
      count: discussions.length,
      total: totalCount,
    })
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch discussions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/discussions
 * Create new discussion thread (authenticated users)
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Title and content are required',
        },
        { status: 400 }
      )
    }

    // If courseId is provided, verify course exists
    if (body.courseId) {
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
    }

    const discussion = await prisma.discussionThread.create({
      data: {
        title: body.title,
        content: body.content,
        courseId: body.courseId || null,
        userId: String(user.userId),
        status: 'OPEN',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            replies: true,
            likes: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: discussion,
        message: 'Discussion created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create discussion',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

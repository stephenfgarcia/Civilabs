/**
 * Discussions API Routes
 * GET /api/discussions - List discussion threads
 * POST /api/discussions - Create new discussion thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/discussions
 * List discussion threads with optional filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const { searchParams } = new URL(request.url)
      const courseId = searchParams.get('courseId')
      const category = searchParams.get('category')
      const search = searchParams.get('search')
      const limit = searchParams.get('limit')
      const offset = searchParams.get('offset')

      const discussions = await prisma.discussionThread.findMany({
        where: {
          ...(courseId && { courseId }),
          ...(category && { category }),
          ...(search && {
            OR: [
              { title: { contains: search, mode: 'insensitive' } },
              { content: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
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
        ...(limit && { take: parseInt(limit) }),
        ...(offset && { skip: parseInt(offset) }),
      })

      // Add user's like status for each thread
      const discussionsWithLikeStatus = await Promise.all(
        discussions.map(async (thread) => {
          const userLike = await prisma.discussionLike.findFirst({
            where: {
              threadId: thread.id,
              userId: user.userId,
            },
          })

          return {
            ...thread,
            isLikedByUser: !!userLike,
          }
        })
      )

      return NextResponse.json({
        success: true,
        data: discussionsWithLikeStatus,
        count: discussionsWithLikeStatus.length,
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
  })(request)
}

/**
 * POST /api/discussions
 * Create new discussion thread
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req, user) => {
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

      // If courseId is provided, verify course exists and user is enrolled
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

        // Check enrollment (except for admins and instructors)
        if (user.role === 'learner') {
          const enrollment = await prisma.enrollment.findFirst({
            where: {
              userId: user.userId,
              courseId: body.courseId,
            },
          })

          if (!enrollment) {
            return NextResponse.json(
              {
                success: false,
                error: 'Forbidden',
                message: 'You must be enrolled in the course to create discussions',
              },
              { status: 403 }
            )
          }
        }
      }

      // Create discussion thread
      const thread = await prisma.discussionThread.create({
        data: {
          title: body.title,
          content: body.content,
          category: body.category || 'General',
          authorId: user.userId,
          courseId: body.courseId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
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
          data: thread,
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
  })(request)
}

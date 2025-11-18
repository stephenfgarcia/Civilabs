/**
 * Discussion Thread Detail API Routes
 * GET /api/discussions/[id] - Get thread with replies
 * PUT /api/discussions/[id] - Update thread (author/admin only)
 * DELETE /api/discussions/[id] - Delete thread (author/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/discussions/[id]
 * Get discussion thread with all replies
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = params

      const thread = await prisma.discussionThread.findUnique({
        where: { id },
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
          replies: {
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
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          _count: {
            select: {
              likes: true,
            },
          },
        },
      })

      if (!thread) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion thread not found',
          },
          { status: 404 }
        )
      }

      // Check if user has liked the thread
      const userLike = await prisma.discussionLike.findFirst({
        where: {
          threadId: thread.id,
          userId: user.userId,
        },
      })

      // Increment view count
      await prisma.discussionThread.update({
        where: { id },
        data: {
          views: {
            increment: 1,
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          ...thread,
          isLikedByUser: !!userLike,
        },
      })
    } catch (error) {
      console.error('Error fetching discussion thread:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch discussion thread',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

/**
 * PUT /api/discussions/[id]
 * Update discussion thread (author or admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = params
      const body = await request.json()

      const thread = await prisma.discussionThread.findUnique({
        where: { id },
      })

      if (!thread) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion thread not found',
          },
          { status: 404 }
        )
      }

      // Check permissions (author or admin)
      if (thread.authorId !== user.userId && user.role !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only edit your own discussions',
          },
          { status: 403 }
        )
      }

      const updateData: any = {}
      if (body.title) updateData.title = body.title
      if (body.content) updateData.content = body.content
      if (body.category) updateData.category = body.category

      // Only admins can pin/lock threads
      if (user.role === 'admin') {
        if (body.isPinned !== undefined) updateData.isPinned = body.isPinned
        if (body.isLocked !== undefined) updateData.isLocked = body.isLocked
      }

      const updatedThread = await prisma.discussionThread.update({
        where: { id },
        data: updateData,
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
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedThread,
        message: 'Discussion updated successfully',
      })
    } catch (error) {
      console.error('Error updating discussion thread:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update discussion thread',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

/**
 * DELETE /api/discussions/[id]
 * Delete discussion thread (author or admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const { id } = params

      const thread = await prisma.discussionThread.findUnique({
        where: { id },
      })

      if (!thread) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion thread not found',
          },
          { status: 404 }
        )
      }

      // Check permissions (author or admin)
      if (thread.authorId !== user.userId && user.role !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only delete your own discussions',
          },
          { status: 403 }
        )
      }

      await prisma.discussionThread.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Discussion deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting discussion thread:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete discussion thread',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

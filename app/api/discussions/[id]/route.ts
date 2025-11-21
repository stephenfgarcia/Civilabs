/**
 * Discussion Thread Detail API Routes
 * GET /api/discussions/[id] - Get thread with replies
 * PUT /api/discussions/[id] - Update thread (author/admin only)
 * DELETE /api/discussions/[id] - Delete thread (author/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/discussions/[id]
 * Get discussion thread with all replies
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { id } = params

    // Increment view count
    await prisma.discussionThread.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })

    const discussion = await prisma.discussionThread.findUnique({
      where: { id },
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
        replies: {
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
            _count: {
              select: {
                likes: true,
                replies: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
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

    if (!discussion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Discussion not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: discussion,
    })
  } catch (error) {
    console.error('Error fetching discussion:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch discussion',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/discussions/[id]
 * Update discussion thread (author/admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()

      // Check if discussion exists
      const existingDiscussion = await prisma.discussionThread.findUnique({
        where: { id },
      })

      if (!existingDiscussion) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion not found',
          },
          { status: 404 }
        )
      }

      // Check if user is author or admin
      const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
      const isAuthor = existingDiscussion.userId === user.userId

      if (!isAdmin && !isAuthor) {
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
      if (body.title !== undefined) updateData.title = body.title
      if (body.content !== undefined) updateData.content = body.content

      // Admin-only moderation fields
      if (isAdmin) {
        if (body.status !== undefined) updateData.status = body.status
        if (body.isPinned !== undefined) updateData.isPinned = body.isPinned
        if (body.isLocked !== undefined) updateData.isLocked = body.isLocked
        if (body.isSolved !== undefined) updateData.isSolved = body.isSolved
        if (body.isFlagged !== undefined) updateData.isFlagged = body.isFlagged
      }

      const updatedDiscussion = await prisma.discussionThread.update({
        where: { id },
        data: updateData,
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

      return NextResponse.json({
        success: true,
        data: updatedDiscussion,
        message: 'Discussion updated successfully',
      })
    } catch (error) {
      console.error('Error updating discussion:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update discussion',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * DELETE /api/discussions/[id]
 * Delete discussion thread (author/admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Check if discussion exists
      const existingDiscussion = await prisma.discussionThread.findUnique({
        where: { id },
      })

      if (!existingDiscussion) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion not found',
          },
          { status: 404 }
        )
      }

      // Check if user is author or admin
      const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
      const isAuthor = existingDiscussion.userId === user.userId

      if (!isAdmin && !isAuthor) {
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
      console.error('Error deleting discussion:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete discussion',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * Instructor Discussion Actions API
 * GET /api/instructor/discussions/[id] - Get discussion details with replies
 * PATCH /api/instructor/discussions/[id] - Update discussion status (pin/lock/solve/flag)
 * DELETE /api/instructor/discussions/[id] - Delete a discussion
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/discussions/[id]
 * Get discussion details with replies
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withInstructor(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      const discussion = await prisma.discussionThread.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              instructorId: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
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
            },
          },
        },
      })

      if (!discussion) {
        return NextResponse.json(
          { success: false, error: 'Discussion not found' },
          { status: 404 }
        )
      }

      // Verify instructor has access (owns the course)
      if (!discussion.course || discussion.course.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to view this discussion' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...discussion,
          courseName: discussion.course.title,
          courseId: discussion.course.id,
          repliesCount: discussion._count.replies,
        },
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
  })(request, context)
}

/**
 * PATCH /api/instructor/discussions/[id]
 * Update discussion moderation status
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withInstructor(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()
      const { action, value } = body // action: 'pin' | 'lock' | 'solve' | 'flag'

      // Verify the discussion belongs to instructor's course
      const discussion = await prisma.discussionThread.findUnique({
        where: { id },
        include: {
          course: {
            select: { instructorId: true },
          },
        },
      })

      if (!discussion) {
        return NextResponse.json(
          { success: false, error: 'Discussion not found' },
          { status: 404 }
        )
      }

      if (!discussion.course || discussion.course.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to moderate this discussion' },
          { status: 403 }
        )
      }

      // Update based on action (legacy format) or direct properties
      const updateData: Record<string, boolean> = {}

      // Support action-based updates (legacy)
      if (action === 'pin') updateData.isPinned = value
      if (action === 'lock') updateData.isLocked = value
      if (action === 'solve') updateData.isSolved = value
      if (action === 'flag') updateData.isFlagged = value

      // Support direct property updates
      if (typeof body.isPinned === 'boolean') updateData.isPinned = body.isPinned
      if (typeof body.isLocked === 'boolean') updateData.isLocked = body.isLocked
      if (typeof body.isSolved === 'boolean') updateData.isSolved = body.isSolved
      if (typeof body.isFlagged === 'boolean') updateData.isFlagged = body.isFlagged

      if (Object.keys(updateData).length === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid update fields provided' },
          { status: 400 }
        )
      }

      const updated = await prisma.discussionThread.update({
        where: { id },
        data: updateData,
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: `Discussion ${action}ed successfully`,
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
 * DELETE /api/instructor/discussions/[id]
 * Delete a discussion (instructor only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withInstructor(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Verify the discussion belongs to instructor's course
      const discussion = await prisma.discussionThread.findUnique({
        where: { id },
        include: {
          course: {
            select: { instructorId: true },
          },
        },
      })

      if (!discussion) {
        return NextResponse.json(
          { success: false, error: 'Discussion not found' },
          { status: 404 }
        )
      }

      if (!discussion.course || discussion.course.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized to delete this discussion' },
          { status: 403 }
        )
      }

      // Delete all replies first
      await prisma.discussionReply.deleteMany({
        where: { threadId: id },
      })

      // Delete the discussion
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

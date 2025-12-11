/**
 * Instructor Discussion Replies API
 * POST /api/instructor/discussions/[id]/replies - Post a reply to a discussion
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * POST /api/instructor/discussions/[id]/replies
 * Post a reply to a discussion
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withInstructor(async (req, user) => {
    try {
      const params = await context.params
      const { id: threadId } = params
      const body = await request.json()
      const { content } = body

      if (!content || !content.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Reply content is required',
          },
          { status: 400 }
        )
      }

      // Verify the discussion exists and belongs to instructor's course
      const discussion = await prisma.discussionThread.findUnique({
        where: { id: threadId },
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
          { success: false, error: 'Not authorized to reply to this discussion' },
          { status: 403 }
        )
      }

      // Check if discussion is locked
      if (discussion.isLocked) {
        return NextResponse.json(
          { success: false, error: 'This discussion is locked and cannot receive new replies' },
          { status: 403 }
        )
      }

      // Create the reply
      const reply = await prisma.discussionReply.create({
        data: {
          threadId,
          userId: String(user.userId),
          content: content.trim(),
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      })

      return NextResponse.json(
        {
          success: true,
          data: reply,
          message: 'Reply posted successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error posting reply:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to post reply',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

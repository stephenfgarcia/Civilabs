/**
 * Discussion Replies API Routes
 * POST /api/discussions/[id]/replies - Reply to a discussion thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/discussions/[id]/replies
 * Create a reply to a discussion thread
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id: threadId } = params
      const body = await request.json()

      // Validate content
      if (!body.content) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Content is required',
          },
          { status: 400 }
        )
      }

      // Verify thread exists
      const thread = await prisma.discussionThread.findUnique({
        where: { id: threadId },
        include: {
          author: {
            select: {
              id: true,
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

      // Check if thread is locked
      if (thread.isLocked && user.role !== 'admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'This discussion is locked',
          },
          { status: 403 }
        )
      }

      // Create reply
      const reply = await prisma.discussionReply.create({
        data: {
          content: body.content,
          threadId,
          authorId: user.userId,
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
        },
      })

      // Create notification for thread author (if not replying to own thread)
      if (thread.author.id !== user.userId) {
        await prisma.notification.create({
          data: {
            userId: thread.author.id,
            type: 'info',
            title: 'New Reply',
            message: `Someone replied to your discussion: "${thread.title}"`,
          },
        })
      }

      return NextResponse.json(
        {
          success: true,
          data: reply,
          message: 'Reply posted successfully',
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error creating reply:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create reply',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

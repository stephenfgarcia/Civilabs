/**
 * Discussion Replies API Routes
 * POST /api/discussions/[id]/replies - Reply to a discussion thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/discussions/[id]/replies
 * Create a reply to a discussion thread
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()

      // Validate required fields
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

      // Check if discussion thread exists
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

      // Check if parent reply exists (if replying to a reply)
      if (body.parentId) {
        const parentReply = await prisma.discussionReply.findUnique({
          where: { id: body.parentId },
        })

        if (!parentReply) {
          return NextResponse.json(
            {
              success: false,
              error: 'Not Found',
              message: 'Parent reply not found',
            },
            { status: 404 }
          )
        }
      }

      const reply = await prisma.discussionReply.create({
        data: {
          threadId: id,
          userId: String(user.userId),
          content: body.content,
          parentId: body.parentId || null,
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
          _count: {
            select: {
              likes: true,
              replies: true,
            },
          },
        },
      })

      // Create notification for thread author (if not replying to own thread)
      if (thread.userId !== user.userId) {
        await prisma.notification.create({
          data: {
            userId: thread.userId,
            type: 'reply',
            title: 'New reply to your discussion',
            message: `${user.firstName} ${user.lastName} replied to your discussion "${thread.title}"`,
            linkUrl: `/discussions/${id}`,
          },
        })
      }

      return NextResponse.json(
        {
          success: true,
          data: reply,
          message: 'Reply created successfully',
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
  })(request, context)
}

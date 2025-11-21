/**
 * Discussion Like API Routes
 * POST /api/discussions/[id]/like - Toggle like on a discussion thread or reply
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/discussions/[id]/like
 * Toggle like/unlike on a discussion thread or reply
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

      const replyId = body.replyId || null

      // Check if liking a thread or reply
      if (replyId) {
        // Check if reply exists
        const reply = await prisma.discussionReply.findUnique({
          where: { id: replyId },
        })

        if (!reply) {
          return NextResponse.json(
            {
              success: false,
              error: 'Not Found',
              message: 'Reply not found',
            },
            { status: 404 }
          )
        }

        // Check if already liked
        const existingLike = await prisma.discussionLike.findUnique({
          where: {
            userId_replyId: {
              userId: String(user.userId),
              replyId: replyId,
            },
          },
        })

        if (existingLike) {
          // Unlike
          await prisma.discussionLike.delete({
            where: { id: existingLike.id },
          })

          return NextResponse.json({
            success: true,
            liked: false,
            message: 'Reply unliked',
          })
        } else {
          // Like
          await prisma.discussionLike.create({
            data: {
              userId: String(user.userId),
              replyId: replyId,
            },
          })

          return NextResponse.json({
            success: true,
            liked: true,
            message: 'Reply liked',
          })
        }
      } else {
        // Liking a thread
        // Check if thread exists
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

        // Check if already liked
        const existingLike = await prisma.discussionLike.findUnique({
          where: {
            userId_threadId: {
              userId: String(user.userId),
              threadId: id,
            },
          },
        })

        if (existingLike) {
          // Unlike
          await prisma.discussionLike.delete({
            where: { id: existingLike.id },
          })

          return NextResponse.json({
            success: true,
            liked: false,
            message: 'Discussion unliked',
          })
        } else {
          // Like
          await prisma.discussionLike.create({
            data: {
              userId: String(user.userId),
              threadId: id,
            },
          })

          return NextResponse.json({
            success: true,
            liked: true,
            message: 'Discussion liked',
          })
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to toggle like',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

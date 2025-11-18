/**
 * Discussion Like API Routes
 * POST /api/discussions/[id]/like - Toggle like on a discussion thread
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * POST /api/discussions/[id]/like
 * Toggle like/unlike on a discussion thread
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const { id: threadId } = params

      // Verify thread exists
      const thread = await prisma.discussionThread.findUnique({
        where: { id: threadId },
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

      // Check if user already liked
      const existingLike = await prisma.discussionLike.findFirst({
        where: {
          threadId,
          userId: user.userId,
        },
      })

      if (existingLike) {
        // Unlike - remove the like
        await prisma.discussionLike.delete({
          where: { id: existingLike.id },
        })

        return NextResponse.json({
          success: true,
          data: {
            liked: false,
          },
          message: 'Like removed',
        })
      } else {
        // Like - create new like
        await prisma.discussionLike.create({
          data: {
            threadId,
            userId: user.userId,
          },
        })

        return NextResponse.json({
          success: true,
          data: {
            liked: true,
          },
          message: 'Discussion liked',
        })
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
  })(request, { params })
}

/**
 * Message Detail API Routes
 * PUT /api/messages/[id] - Mark message as read/delivered
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * PUT /api/messages/[id]
 * Update message status (mark as read/delivered)
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

      const message = await prisma.message.findUnique({
        where: { id },
        include: {
          conversation: true,
        },
      })

      if (!message) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Message not found',
          },
          { status: 404 }
        )
      }

      // Verify user is the recipient
      const isRecipient =
        (message.conversation.participant1 === user.userId &&
          message.senderId === message.conversation.participant2) ||
        (message.conversation.participant2 === user.userId &&
          message.senderId === message.conversation.participant1)

      if (!isRecipient) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only update messages sent to you',
          },
          { status: 403 }
        )
      }

      const updatedMessage = await prisma.message.update({
        where: { id },
        data: {
          status: body.status || 'READ',
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedMessage,
        message: 'Message updated successfully',
      })
    } catch (error) {
      console.error('Error updating message:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update message',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

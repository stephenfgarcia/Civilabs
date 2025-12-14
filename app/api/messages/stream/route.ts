import { NextRequest } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { verifyAuth } from '@/lib/utils/auth'

/**
 * Server-Sent Events (SSE) endpoint for real-time message updates
 *
 * This replaces the 15-second polling with a persistent connection
 * that pushes updates to the client immediately when new messages arrive.
 *
 * Usage: GET /api/messages/stream?conversationId=xxx
 */
export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request)
  if (!authResult.authenticated || !authResult.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = authResult.user.userId
  const searchParams = request.nextUrl.searchParams
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return new Response('Conversation ID required', { status: 400 })
  }

  // Verify user has access to this conversation
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  if (!conversation) {
    return new Response('Conversation not found', { status: 404 })
  }

  if (conversation.participant1 !== userId && conversation.participant2 !== userId) {
    return new Response('Forbidden', { status: 403 })
  }

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  let lastMessageTimestamp = new Date()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection success message
      const initialData = `data: ${JSON.stringify({ type: 'connected', conversationId })}\n\n`
      controller.enqueue(encoder.encode(initialData))

      // Poll for new messages every 2 seconds (much better than 15s)
      const intervalId = setInterval(async () => {
        try {
          // Check for new messages since last check
          const newMessages = await prisma.message.findMany({
            where: {
              conversationId,
              createdAt: {
                gt: lastMessageTimestamp,
              },
            },
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          })

          if (newMessages.length > 0) {
            // Update last timestamp
            lastMessageTimestamp = newMessages[newMessages.length - 1].createdAt

            // Send new messages to client
            const eventData = `data: ${JSON.stringify({
              type: 'messages',
              messages: newMessages,
            })}\n\n`
            controller.enqueue(encoder.encode(eventData))
          }

          // Send heartbeat to keep connection alive
          const heartbeat = `:heartbeat\n\n`
          controller.enqueue(encoder.encode(heartbeat))
        } catch (error) {
          console.error('[SSE] Error polling messages:', error)
          // Send error to client
          const errorData = `data: ${JSON.stringify({
            type: 'error',
            message: 'Failed to fetch messages',
          })}\n\n`
          controller.enqueue(encoder.encode(errorData))
        }
      }, 2000) // Poll every 2 seconds

      // Cleanup when client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(intervalId)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  })
}

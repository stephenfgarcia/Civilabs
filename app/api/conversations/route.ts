/**
 * Conversations API Routes
 * GET /api/conversations - List user's conversations
 * POST /api/conversations - Create or get conversation with another user
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/conversations
 * List all conversations for the current user
 */
export const GET = withAuth(async (request, user) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1: String(user.userId) },
          { participant2: String(user.userId) },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        user2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            content: true,
            senderId: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        lastMessageAt: 'desc',
      },
    })

    // Format conversations to include the "other" participant
    const formattedConversations = conversations.map((conv) => {
      const isUser1 = conv.participant1 === user.userId
      const otherParticipant = isUser1 ? conv.user2 : conv.user1
      const lastMessage = conv.messages[0] || null

      // Count unread messages
      const unreadCount = conv.messages.filter(
        (msg) => msg.senderId !== user.userId && msg.status !== 'READ'
      ).length

      return {
        id: conv.id,
        participant: otherParticipant,
        lastMessage,
        lastMessageAt: conv.lastMessageAt,
        unreadCount,
        createdAt: conv.createdAt,
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedConversations,
      count: formattedConversations.length,
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch conversations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/conversations
 * Create or get existing conversation with another user
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    if (!body.participantId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'participantId is required',
        },
        { status: 400 }
      )
    }

    // Check if participant exists
    const participant = await prisma.user.findUnique({
      where: { id: body.participantId },
    })

    if (!participant) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Participant not found',
        },
        { status: 404 }
      )
    }

    // Check if conversation already exists (in either direction)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1: String(user.userId),
            participant2: body.participantId,
          },
          {
            participant1: body.participantId,
            participant2: String(user.userId),
          },
        ],
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        user2: {
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

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: existingConversation,
        message: 'Conversation retrieved',
      })
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participant1: String(user.userId),
        participant2: body.participantId,
      },
      include: {
        user1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            role: true,
          },
        },
        user2: {
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

    return NextResponse.json(
      {
        success: true,
        data: conversation,
        message: 'Conversation created',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create conversation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

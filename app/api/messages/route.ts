/**
 * Messages API Routes
 * GET /api/messages?conversationId=xxx - Get messages in a conversation
 * POST /api/messages - Send a message
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/messages
 * Get messages in a conversation with pagination
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0

    if (!conversationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'conversationId is required',
        },
        { status: 400 }
      )
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Conversation not found',
        },
        { status: 404 }
      )
    }

    if (
      conversation.participant1 !== user.userId &&
      conversation.participant2 !== user.userId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You are not part of this conversation',
        },
        { status: 403 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
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
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
      skip: offset,
    })

    const totalCount = await prisma.message.count({
      where: { conversationId },
    })

    // Mark messages as read if they were sent to current user
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: String(user.userId),
        },
        status: {
          not: 'READ',
        },
      },
      data: {
        status: 'READ',
      },
    })

    return NextResponse.json({
      success: true,
      data: messages,
      count: messages.length,
      total: totalCount,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/messages
 * Send a message in a conversation
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    if (!body.conversationId || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'conversationId and content are required',
        },
        { status: 400 }
      )
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: body.conversationId },
    })

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Conversation not found',
        },
        { status: 404 }
      )
    }

    if (
      conversation.participant1 !== user.userId &&
      conversation.participant2 !== user.userId
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You are not part of this conversation',
        },
        { status: 403 }
      )
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: body.conversationId,
        senderId: String(user.userId),
        content: body.content,
        status: 'SENT',
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

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: body.conversationId },
      data: {
        lastMessageAt: new Date(),
      },
    })

    // Create notification for recipient
    const recipientId =
      conversation.participant1 === user.userId
        ? conversation.participant2
        : conversation.participant1

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'message',
        title: 'New message',
        message: `${user.firstName} ${user.lastName} sent you a message`,
        linkUrl: `/messages?conversationId=${body.conversationId}`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: message,
        message: 'Message sent successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

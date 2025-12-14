import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { verifyAuth } from '@/lib/utils/auth'

/**
 * Create a report for inappropriate discussion content
 *
 * POST /api/discussions/report
 * Body: { threadId?: string, replyId?: string, reason: string, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { threadId, replyId, reason, description } = body

    // Validate that at least one of threadId or replyId is provided
    if (!threadId && !replyId) {
      return NextResponse.json(
        { success: false, error: 'Either threadId or replyId must be provided' },
        { status: 400 }
      )
    }

    // Validate reason
    const validReasons = ['SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'MISINFORMATION', 'OFF_TOPIC', 'OTHER']
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { success: false, error: 'Invalid report reason' },
        { status: 400 }
      )
    }

    // Check if the content exists
    if (threadId) {
      const thread = await prisma.discussionThread.findUnique({
        where: { id: threadId },
      })
      if (!thread) {
        return NextResponse.json(
          { success: false, error: 'Discussion thread not found' },
          { status: 404 }
        )
      }
    }

    if (replyId) {
      const reply = await prisma.discussionReply.findUnique({
        where: { id: replyId },
      })
      if (!reply) {
        return NextResponse.json(
          { success: false, error: 'Discussion reply not found' },
          { status: 404 }
        )
      }
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        reporterId: authResult.user.userId,
        threadId: threadId || null,
        replyId: replyId || null,
        reason,
        description: description || null,
        status: 'PENDING',
      },
    })

    // If this is the first report for this content, flag it
    if (threadId) {
      const reportCount = await prisma.report.count({
        where: { threadId },
      })
      if (reportCount === 1) {
        await prisma.discussionThread.update({
          where: { id: threadId },
          data: { isFlagged: true },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report submitted successfully. Our team will review it shortly.',
    })
  } catch (error) {
    console.error('[Report] Error creating report:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create report',
      },
      { status: 500 }
    )
  }
}

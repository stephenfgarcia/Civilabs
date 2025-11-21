/**
 * Discussion Moderation API Route
 * POST /api/discussions/[id]/moderate - Perform moderation actions (admin/instructor only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * POST /api/discussions/[id]/moderate
 * Perform moderation action on discussion thread
 * Actions: pin, unpin, lock, unlock, solve, unsolve, flag, unflag
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user, ctx) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()

      // Check if user is admin or instructor
      const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
      const isInstructor = ['INSTRUCTOR'].includes(user.role)

      if (!isAdmin && !isInstructor) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'Only admins and instructors can moderate discussions',
          },
          { status: 403 }
        )
      }

      // Check if discussion exists
      const discussion = await prisma.discussionThread.findUnique({
        where: { id },
        include: {
          course: {
            select: {
              id: true,
              instructorId: true,
            },
          },
        },
      })

      if (!discussion) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Discussion not found',
          },
          { status: 404 }
        )
      }

      // If instructor, verify they own the course
      if (isInstructor && !isAdmin) {
        if (!discussion.course || discussion.course.instructorId !== user.userId) {
          return NextResponse.json(
            {
              success: false,
              error: 'Forbidden',
              message: 'You can only moderate discussions in your courses',
            },
            { status: 403 }
          )
        }
      }

      // Validate action
      const { action } = body
      const validActions = [
        'pin',
        'unpin',
        'lock',
        'unlock',
        'solve',
        'unsolve',
        'flag',
        'unflag',
      ]

      if (!action || !validActions.includes(action)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: `Invalid action. Must be one of: ${validActions.join(', ')}`,
          },
          { status: 400 }
        )
      }

      // Build update data based on action
      const updateData: any = {}

      switch (action) {
        case 'pin':
          updateData.isPinned = true
          break
        case 'unpin':
          updateData.isPinned = false
          break
        case 'lock':
          updateData.isLocked = true
          break
        case 'unlock':
          updateData.isLocked = false
          break
        case 'solve':
          updateData.isSolved = true
          break
        case 'unsolve':
          updateData.isSolved = false
          break
        case 'flag':
          updateData.isFlagged = true
          break
        case 'unflag':
          updateData.isFlagged = false
          break
      }

      // Update discussion
      const updatedDiscussion = await prisma.discussionThread.update({
        where: { id },
        data: updateData,
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
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          _count: {
            select: {
              replies: true,
              likes: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedDiscussion,
        message: `Discussion ${action}ned successfully`,
      })
    } catch (error) {
      console.error('Error moderating discussion:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to moderate discussion',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

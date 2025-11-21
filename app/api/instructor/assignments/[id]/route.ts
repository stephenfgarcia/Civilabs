/**
 * Instructor Assignment Details API Routes
 * GET /api/instructor/assignments/[id] - Get assignment details with submissions
 * PATCH /api/instructor/assignments/[id] - Update or publish assignment
 * DELETE /api/instructor/assignments/[id] - Delete assignment
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/instructor/assignments/[id]
 * Get assignment details with submissions
 */
export async function GET(request: NextRequest, context: RouteContext) {
  return withInstructor(async (req, user) => {
    const { id } = await context.params

    try {
      // Fetch assignment with submissions
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          submissions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
            orderBy: {
              submittedAt: 'desc',
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
      })

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        )
      }

      // Verify instructor owns this assignment
      if (assignment.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized' },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        data: assignment,
      })
    } catch (error) {
      console.error('Error fetching assignment:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch assignment',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * PATCH /api/instructor/assignments/[id]
 * Update assignment or publish/close it
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withInstructor(async (req, user) => {
    const { id } = await context.params

    try {
      const body = await request.json()
      const { action, ...updateData } = body

      // Fetch assignment to verify ownership
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        select: {
          instructorId: true,
        },
      })

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        )
      }

      if (assignment.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized' },
          { status: 403 }
        )
      }

      // Handle publish/close actions
      if (action === 'publish') {
        const updated = await prisma.assignment.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        })

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Assignment published successfully',
        })
      }

      if (action === 'close') {
        const updated = await prisma.assignment.update({
          where: { id },
          data: {
            status: 'CLOSED',
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        })

        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Assignment closed successfully',
        })
      }

      // Regular update
      const dataToUpdate: any = {}

      if (updateData.title !== undefined) dataToUpdate.title = updateData.title
      if (updateData.description !== undefined)
        dataToUpdate.description = updateData.description
      if (updateData.instructions !== undefined)
        dataToUpdate.instructions = updateData.instructions
      if (updateData.dueDate !== undefined)
        dataToUpdate.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : null
      if (updateData.maxPoints !== undefined)
        dataToUpdate.maxPoints = updateData.maxPoints
      if (updateData.allowLateSubmission !== undefined)
        dataToUpdate.allowLateSubmission = updateData.allowLateSubmission
      if (updateData.attachmentUrl !== undefined)
        dataToUpdate.attachmentUrl = updateData.attachmentUrl

      const updated = await prisma.assignment.update({
        where: { id },
        data: dataToUpdate,
        include: {
          course: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Assignment updated successfully',
      })
    } catch (error) {
      console.error('Error updating assignment:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update assignment',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * DELETE /api/instructor/assignments/[id]
 * Delete assignment and all submissions
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withInstructor(async (req, user) => {
    const { id } = await context.params

    try {
      // Fetch assignment to verify ownership
      const assignment = await prisma.assignment.findUnique({
        where: { id },
        select: {
          instructorId: true,
        },
      })

      if (!assignment) {
        return NextResponse.json(
          { success: false, error: 'Assignment not found' },
          { status: 404 }
        )
      }

      if (assignment.instructorId !== String(user.userId)) {
        return NextResponse.json(
          { success: false, error: 'Not authorized' },
          { status: 403 }
        )
      }

      // Delete assignment (submissions will be cascade deleted)
      await prisma.assignment.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Assignment deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting assignment:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete assignment',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * Instructor Assignment Submission Grading API Route
 * PATCH /api/instructor/assignments/[id]/submissions/[submissionId] - Grade a submission
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

interface RouteContext {
  params: Promise<{
    id: string
    submissionId: string
  }>
}

/**
 * PATCH /api/instructor/assignments/[id]/submissions/[submissionId]
 * Grade a student submission
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  return withInstructor(async (req, user) => {
    const { id: assignmentId, submissionId } = await context.params

    try {
      const body = await request.json()
      const { grade, feedback } = body

      // Validate input
      if (grade === undefined || grade === null) {
        return NextResponse.json(
          { success: false, error: 'Grade is required' },
          { status: 400 }
        )
      }

      // Fetch assignment to verify ownership
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        select: {
          instructorId: true,
          maxPoints: true,
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

      // Validate grade range
      if (grade < 0 || grade > assignment.maxPoints) {
        return NextResponse.json(
          {
            success: false,
            error: `Grade must be between 0 and ${assignment.maxPoints}`,
          },
          { status: 400 }
        )
      }

      // Update submission with grade and feedback
      const updatedSubmission = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: {
          grade: Number(grade),
          feedback: feedback || null,
          status: 'GRADED',
          gradedAt: new Date(),
          gradedBy: String(user.userId),
        },
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
      })

      return NextResponse.json({
        success: true,
        data: updatedSubmission,
        message: 'Submission graded successfully',
      })
    } catch (error) {
      console.error('Error grading submission:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to grade submission',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

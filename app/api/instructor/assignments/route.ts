/**
 * Instructor Assignments API Routes
 * GET /api/instructor/assignments - Get all assignments for instructor's courses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/assignments
 * Get all assignments for the instructor's courses with filters
 */
export const GET = withInstructor(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Get instructor's courses
    const instructorCourses = await prisma.course.findMany({
      where: { instructorId: String(user.userId) },
      select: { id: true },
    })

    const courseIds = instructorCourses.map((c) => c.id)

    // Build where clause
    const where: any = {
      courseId: courseId ? courseId : { in: courseIds },
    }

    // Filter by status
    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    // Search by title
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Fetch assignments with related data
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
        submissions: {
          where: {
            status: 'SUBMITTED',
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    })

    // Calculate stats
    const totalAssignments = await prisma.assignment.count({
      where: { instructorId: String(user.userId) },
    })

    const publishedAssignments = await prisma.assignment.count({
      where: {
        instructorId: String(user.userId),
        status: 'PUBLISHED',
      },
    })

    const overdueAssignments = await prisma.assignment.count({
      where: {
        instructorId: String(user.userId),
        status: 'PUBLISHED',
        dueDate: {
          lt: new Date(),
        },
      },
    })

    // Count total pending submissions across all instructor's assignments
    const allInstructorAssignments = await prisma.assignment.findMany({
      where: { instructorId: String(user.userId) },
      select: { id: true },
    })

    const pendingSubmissions = await prisma.assignmentSubmission.count({
      where: {
        assignmentId: { in: allInstructorAssignments.map((a) => a.id) },
        status: 'SUBMITTED',
      },
    })

    // Format assignments data
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      courseId: assignment.courseId,
      courseName: assignment.course.title,
      status: assignment.status,
      dueDate: assignment.dueDate,
      maxPoints: assignment.maxPoints,
      totalSubmissions: assignment._count.submissions,
      pendingSubmissions: assignment.submissions.length,
      createdAt: assignment.createdAt,
      publishedAt: assignment.publishedAt,
    }))

    return NextResponse.json({
      success: true,
      data: {
        assignments: formattedAssignments,
        stats: {
          total: totalAssignments,
          published: publishedAssignments,
          overdue: overdueAssignments,
          pendingGrading: pendingSubmissions,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching instructor assignments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assignments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/instructor/assignments
 * Create a new assignment
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const {
      title,
      description,
      instructions,
      courseId,
      dueDate,
      maxPoints,
      allowLateSubmission,
      attachmentUrl,
    } = body

    // Verify instructor owns the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    })

    if (!course || course.instructorId !== String(user.userId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authorized to create assignments for this course',
        },
        { status: 403 }
      )
    }

    // Create assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        instructions,
        courseId,
        instructorId: String(user.userId),
        dueDate: dueDate ? new Date(dueDate) : null,
        maxPoints: maxPoints || 100,
        allowLateSubmission: allowLateSubmission || false,
        attachmentUrl,
        status: 'DRAFT',
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
      data: assignment,
      message: 'Assignment created successfully',
    })
  } catch (error) {
    console.error('Error creating assignment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create assignment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

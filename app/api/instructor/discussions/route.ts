/**
 * Instructor Discussions API Routes
 * GET /api/instructor/discussions - Get discussions from instructor's courses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/discussions
 * Get all discussions from the instructor's courses
 */
export const GET = withInstructor(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status') // 'all', 'flagged', 'solved', 'unsolved'
    const search = searchParams.get('search')

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

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
    if (status === 'flagged') {
      where.isFlagged = true
    } else if (status === 'solved') {
      where.isSolved = true
    } else if (status === 'unsolved') {
      where.isSolved = false
    }

    // Search in title or content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Count total for pagination
    const totalCount = await prisma.discussionThread.count({ where })

    // Fetch discussions with related data (paginated)
    const discussions = await prisma.discussionThread.findMany({
      where,
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
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            replies: true,
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: limit,
    })

    // Get total counts for stats
    const totalDiscussions = await prisma.discussionThread.count({
      where: { courseId: { in: courseIds } },
    })

    const flaggedCount = await prisma.discussionThread.count({
      where: { courseId: { in: courseIds }, isFlagged: true },
    })

    const solvedCount = await prisma.discussionThread.count({
      where: { courseId: { in: courseIds }, isSolved: true },
    })

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: {
        discussions: discussions.map((d) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          courseId: d.courseId,
          courseName: d.course?.title || 'General Discussion',
          user: {
            id: d.user.id,
            name: `${d.user.firstName} ${d.user.lastName}`,
            email: d.user.email,
            avatarUrl: d.user.avatarUrl,
          },
          isPinned: d.isPinned,
          isLocked: d.isLocked,
          isFlagged: d.isFlagged,
          isSolved: d.isSolved,
          repliesCount: d._count.replies,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          total: totalDiscussions,
          flagged: flaggedCount,
          solved: solvedCount,
          unsolved: totalDiscussions - solvedCount,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching instructor discussions:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch discussions',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

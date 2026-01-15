/**
 * User Achievements API Routes
 * GET /api/users/me/achievements - Get current user's achievements
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/users/me/achievements
 * Get current user's achievements
 * Achievements are derived from completed courses and other accomplishments
 */
export const GET = withAuth(async (request, user) => {
  try {
    // Get completed enrollments as achievements
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        userId: String(user.userId),
        status: 'COMPLETED',
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
      orderBy: {
        completedAt: 'desc',
      },
    })

    // Transform completed courses into achievement format
    const achievements = completedEnrollments.map((enrollment, index) => ({
      id: enrollment.id,
      title: enrollment.course.title,
      description: `Completed: ${enrollment.course.description || enrollment.course.title}`,
      points: 100, // Base points for course completion
      earnedDate: enrollment.completedAt?.toISOString() || enrollment.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      data: achievements,
    })
  } catch (error) {
    console.error('Error fetching user achievements:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch achievements',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

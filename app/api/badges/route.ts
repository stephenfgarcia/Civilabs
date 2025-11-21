/**
 * Badges API Routes
 * GET /api/badges - Get all badges with user's progress
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/badges
 * Get all badges with user's earned status and progress
 */
export const GET = withAuth(async (request, user) => {
  try {
    // Fetch all badges
    const allBadges = await prisma.badge.findMany({
      orderBy: {
        points: 'asc',
      },
    })

    // Fetch user's earned badges
    const earnedBadges = await prisma.userBadge.findMany({
      where: {
        userId: String(user.userId),
      },
      include: {
        badge: true,
      },
    })

    // Create a map of earned badge IDs
    const earnedBadgeMap = new Map(
      earnedBadges.map((ub) => [ub.badgeId, ub.earnedAt])
    )

    // Get user stats for progress calculation
    const userStats = await getUserStats(String(user.userId))

    // Format badges with earned status and progress
    const formattedBadges = allBadges.map((badge) => {
      const isEarned = earnedBadgeMap.has(badge.id)
      const earnedDate = earnedBadgeMap.get(badge.id)
      const progress = calculateBadgeProgress(badge, userStats)

      return {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        iconUrl: badge.iconUrl,
        points: badge.points,
        earned: isEarned,
        earnedDate: earnedDate || null,
        progress: isEarned ? 100 : progress,
        criteria: badge.criteria,
      }
    })

    // Calculate stats
    const totalBadges = allBadges.length
    const earnedCount = earnedBadges.length
    const totalPoints = earnedBadges.reduce(
      (sum, ub) => sum + ub.badge.points,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        badges: formattedBadges,
        stats: {
          total: totalBadges,
          earned: earnedCount,
          totalPoints,
          completionPercentage:
            totalBadges > 0 ? Math.round((earnedCount / totalBadges) * 100) : 0,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch badges',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * Get user statistics for badge progress calculation
 */
async function getUserStats(userId: string) {
  const [
    completedLessons,
    completedCourses,
    quizAttempts,
    certificates,
    discussions,
    enrollments,
  ] = await Promise.all([
    // Completed lessons count
    prisma.lessonProgress.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    }),

    // Completed courses count
    prisma.enrollment.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    }),

    // Quiz attempts
    prisma.quizAttempt.findMany({
      where: {
        userId,
      },
      select: {
        scorePercentage: true,
        passed: true,
      },
    }),

    // Certificates
    prisma.userCertificate.count({
      where: {
        userId,
      },
    }),

    // Discussion participation
    prisma.discussionThread.count({
      where: {
        userId,
      },
    }),

    // Total enrollments
    prisma.enrollment.findMany({
      where: {
        userId,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ])

  // Calculate perfect quiz scores
  const perfectQuizScores = quizAttempts.filter(
    (attempt) => attempt.scorePercentage === 100
  ).length

  // Calculate average quiz score
  const averageQuizScore =
    quizAttempts.length > 0
      ? quizAttempts.reduce(
          (sum, attempt) => sum + (attempt.scorePercentage || 0),
          0
        ) / quizAttempts.length
      : 0

  // Calculate learning streak (simplified - just check if enrolled in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentEnrollments = enrollments.filter(
    (e) => new Date(e.createdAt) >= sevenDaysAgo
  )
  const currentStreak = recentEnrollments.length

  return {
    completedLessons,
    completedCourses,
    perfectQuizScores,
    averageQuizScore,
    certificates,
    discussions,
    currentStreak,
    totalEnrollments: enrollments.length,
  }
}

/**
 * Calculate badge progress based on criteria
 */
function calculateBadgeProgress(
  badge: any,
  stats: ReturnType<typeof getUserStats> extends Promise<infer T> ? T : never
): number {
  const criteria = badge.criteria as any

  if (!criteria || !criteria.type) return 0

  switch (criteria.type) {
    case 'lessons_completed':
      return Math.min(
        100,
        Math.round((stats.completedLessons / (criteria.target || 1)) * 100)
      )

    case 'courses_completed':
      return Math.min(
        100,
        Math.round((stats.completedCourses / (criteria.target || 1)) * 100)
      )

    case 'perfect_quizzes':
      return Math.min(
        100,
        Math.round((stats.perfectQuizScores / (criteria.target || 1)) * 100)
      )

    case 'certificates_earned':
      return Math.min(
        100,
        Math.round((stats.certificates / (criteria.target || 1)) * 100)
      )

    case 'discussion_participation':
      return Math.min(
        100,
        Math.round((stats.discussions / (criteria.target || 1)) * 100)
      )

    case 'learning_streak':
      return Math.min(
        100,
        Math.round((stats.currentStreak / (criteria.target || 1)) * 100)
      )

    case 'quiz_average':
      return Math.min(
        100,
        Math.round((stats.averageQuizScore / (criteria.target || 100)) * 100)
      )

    default:
      return 0
  }
}

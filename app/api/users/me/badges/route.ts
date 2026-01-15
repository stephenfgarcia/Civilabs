/**
 * User Badges API Routes
 * GET /api/users/me/badges - Get current user's badges
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/users/me/badges
 * Get current user's badges (both earned and available)
 */
export const GET = withAuth(async (request, user) => {
  try {
    // Get user's earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: {
        userId: String(user.userId),
      },
      include: {
        badge: true,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    })

    // Get all available badges to show locked ones too
    const allBadges = await prisma.badge.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    // Create a set of earned badge IDs for quick lookup
    const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId))

    // Transform badges into the expected format
    const badges = allBadges.map(badge => {
      const userBadge = userBadges.find(ub => ub.badgeId === badge.id)
      return {
        id: badge.id,
        name: badge.name,
        description: badge.description || '',
        icon: badge.iconUrl || 'Award',
        earnedDate: userBadge?.earnedAt.toISOString() || null,
        category: 'general',
        points: badge.points,
      }
    })

    return NextResponse.json({
      success: true,
      data: badges,
    })
  } catch (error) {
    console.error('Error fetching user badges:', error)
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { verifyAuth } from '@/lib/utils/auth'

/**
 * Calculate user's current learning streak based on consecutive login days
 *
 * Algorithm:
 * 1. Fetch all user activity logs ordered by date (descending)
 * 2. Start from today and count consecutive days with activity
 * 3. Break the streak if a day is missed
 * 4. Return the current streak count
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = authResult.user.userId

    // Get user's activity logs ordered by date (most recent first)
    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: userId,
        action: 'LOGIN',
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        createdAt: true,
      },
    })

    // If no login activity found, streak is 0
    if (activityLogs.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 0,
          lastLoginDate: null,
        },
      })
    }

    // Calculate streak
    let currentStreak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset to start of day

    // Group activities by date (ignoring time)
    const uniqueDates = new Set<string>()
    activityLogs.forEach(log => {
      const logDate = new Date(log.createdAt)
      logDate.setHours(0, 0, 0, 0)
      uniqueDates.add(logDate.toISOString())
    })

    const sortedDates = Array.from(uniqueDates)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())

    // Check if user logged in today or yesterday (to maintain streak)
    const mostRecentLogin = sortedDates[0]
    const daysSinceLastLogin = Math.floor((today.getTime() - mostRecentLogin.getTime()) / (1000 * 60 * 60 * 24))

    // If last login was more than 1 day ago, streak is broken
    if (daysSinceLastLogin > 1) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 0,
          lastLoginDate: mostRecentLogin.toISOString(),
        },
      })
    }

    // Count consecutive days
    currentStreak = 1 // Start with 1 for the most recent login day
    let expectedDate = new Date(mostRecentLogin)

    for (let i = 1; i < sortedDates.length; i++) {
      // Move expected date back by 1 day
      expectedDate.setDate(expectedDate.getDate() - 1)

      const currentDate = sortedDates[i]

      // Check if current date matches expected consecutive date
      if (currentDate.toISOString() === expectedDate.toISOString()) {
        currentStreak++
      } else {
        // Streak broken
        break
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        lastLoginDate: mostRecentLogin.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error calculating streak:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate streak',
      },
      { status: 500 }
    )
  }
}

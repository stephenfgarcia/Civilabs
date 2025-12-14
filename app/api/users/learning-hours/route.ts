import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { verifyAuth } from '@/lib/utils/auth'

/**
 * Calculate user's total learning hours based on time spent in lessons
 *
 * This endpoint sums up all timeSpentSeconds from LessonProgress records
 * and converts it to hours for display on the dashboard
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

    // Get all lesson progress records for the user
    const lessonProgressRecords = await prisma.lessonProgress.findMany({
      where: {
        userId: userId,
      },
      select: {
        timeSpentSeconds: true,
      },
    })

    // Calculate total time in seconds
    const totalSeconds = lessonProgressRecords.reduce(
      (acc, record) => acc + (record.timeSpentSeconds || 0),
      0
    )

    // Convert to hours (rounded to 1 decimal place)
    const totalHours = Math.round((totalSeconds / 3600) * 10) / 10

    return NextResponse.json({
      success: true,
      data: {
        totalHours,
        totalSeconds,
        totalMinutes: Math.round(totalSeconds / 60),
      },
    })
  } catch (error) {
    console.error('Error calculating learning hours:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate learning hours',
      },
      { status: 500 }
    )
  }
}

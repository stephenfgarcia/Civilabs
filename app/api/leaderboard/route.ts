import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const period = searchParams.get('period') || 'all-time' // all-time, monthly, weekly

    const leaderboard = await prisma.userPoints.findMany({
      take: limit,
      orderBy: { points: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            department: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        userId: entry.user.id,
        name: `${entry.user.firstName} ${entry.user.lastName}`,
        avatar: entry.user.avatarUrl,
        department: entry.user.department?.name,
        points: entry.points,
        level: entry.level
      }))
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

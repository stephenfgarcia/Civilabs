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
            },
            enrollments: {
              where: { status: 'COMPLETED' },
              select: { id: true }
            },
            certificates: {
              select: { id: true }
            },
            badges: {
              select: {
                badge: {
                  select: {
                    name: true,
                    points: true
                  }
                }
              },
              orderBy: {
                earnedAt: 'desc'
              },
              take: 1
            }
          }
        }
      }
    })

    // Get badge names based on rank for users without badges
    const getBadgeName = (rank: number, points: number) => {
      if (rank === 1 && points > 1000) return 'Master Builder'
      if (rank === 2 && points > 800) return 'Expert Learner'
      if (rank === 3 && points > 600) return 'Safety Champion'
      if (rank <= 5 && points > 400) return 'Rising Star'
      if (points > 200) return 'Dedicated Learner'
      return 'Learner'
    }

    // Calculate learning streak (simplified - based on recent enrollments)
    const getUserStreak = async (userId: string) => {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentEnrollments = await prisma.enrollment.count({
        where: {
          userId,
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })

      return recentEnrollments
    }

    // Enrich data with streaks
    const enrichedData = await Promise.all(
      leaderboard.map(async (entry, index) => {
        const rank = index + 1
        const coursesCompleted = entry.user.enrollments.length
        const certificates = entry.user.certificates.length
        const streak = await getUserStreak(entry.user.id)
        const latestBadge = entry.user.badges[0]?.badge.name || getBadgeName(rank, entry.points)

        return {
          rank,
          userId: entry.user.id,
          name: `${entry.user.firstName} ${entry.user.lastName}`,
          avatar: entry.user.avatarUrl,
          department: entry.user.department?.name,
          points: entry.points,
          level: entry.level,
          coursesCompleted,
          certificates,
          streak,
          badge: latestBadge
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedData
    })
  } catch (error) {
    console.error('Leaderboard fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

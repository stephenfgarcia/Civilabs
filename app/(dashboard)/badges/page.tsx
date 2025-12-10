'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Award,
  Star,
  Target,
  Zap,
  Trophy,
  Flame,
  Medal,
  Crown,
  CheckCircle,
  Lock,
  TrendingUp
} from 'lucide-react'
import { apiClient } from '@/lib/services'
import { useToast } from '@/lib/hooks'

interface Badge {
  id: string
  name: string
  description: string | null
  iconUrl: string | null
  points: number
  earned: boolean
  earnedDate: string | null
  progress: number
  criteria: any
}

interface Stats {
  total: number
  earned: number
  totalPoints: number
  completionPercentage: number
}

// Icon mapping for badges (fallback if no iconUrl)
const ICON_MAP: Record<string, any> = {
  star: Star,
  award: Award,
  trophy: Trophy,
  flame: Flame,
  target: Target,
  zap: Zap,
  medal: Medal,
  crown: Crown,
}

// Color schemes for different point ranges
const getColorScheme = (points: number) => {
  if (points >= 100) return 'from-warning to-orange-600'
  if (points >= 50) return 'from-secondary to-purple-600'
  if (points >= 25) return 'from-primary to-blue-600'
  return 'from-success to-green-600'
}

// Get icon based on criteria type or name
const getBadgeIcon = (badge: Badge) => {
  if (badge.criteria?.type) {
    switch (badge.criteria.type) {
      case 'lessons_completed':
        return Star
      case 'courses_completed':
        return Award
      case 'perfect_quizzes':
        return Trophy
      case 'learning_streak':
        return Flame
      case 'certificates_earned':
        return Medal
      case 'discussion_participation':
        return Target
      default:
        return Award
    }
  }
  return Award
}

// Format criteria for display
const getCriteriaText = (badge: Badge) => {
  if (!badge.criteria || !badge.criteria.type) return 'Complete the challenge'

  const target = badge.criteria.target || 1

  switch (badge.criteria.type) {
    case 'lessons_completed':
      return `Complete ${target} lesson${target > 1 ? 's' : ''}`
    case 'courses_completed':
      return `Complete ${target} course${target > 1 ? 's' : ''}`
    case 'perfect_quizzes':
      return `Get 100% on ${target} quiz${target > 1 ? 'zes' : ''}`
    case 'learning_streak':
      return `Maintain ${target} day streak`
    case 'certificates_earned':
      return `Earn ${target} certificate${target > 1 ? 's' : ''}`
    case 'discussion_participation':
      return `Start ${target} discussion${target > 1 ? 's' : ''}`
    case 'quiz_average':
      return `Achieve ${target}% quiz average`
    default:
      return 'Complete the challenge'
  }
}

export default function BadgesPage() {
  const { toast } = useToast()
  const [badges, setBadges] = useState<Badge[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    earned: 0,
    totalPoints: 0,
    completionPercentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/badges')

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setBadges(apiData.data?.badges || [])
        setStats(apiData.data?.stats || {
          total: 0,
          earned: 0,
          totalPoints: 0,
          completionPercentage: 0,
        })
      } else {
        throw new Error(response.error || 'Failed to fetch badges')
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load badges'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      // Simple CSS-only entrance animations
      const elements = document.querySelectorAll('.badge-item')
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
      })
    }
  }, [loading])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-neutral-600">Loading badges...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Badges</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBadges}
            className="bg-warning hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="badge-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-warning/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-warning via-orange-500 to-yellow-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <Award className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  BADGES & ACHIEVEMENTS
                </h1>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  TRACK YOUR LEARNING MILESTONES
                </p>
              </div>
            </div>

            <p className="text-lg text-neutral-700 font-medium mb-6 max-w-2xl">
              Earn badges by completing courses, maintaining streaks, and achieving milestones. Collect them all!
            </p>

            {/* Progress Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-effect border-2 border-success/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
                    {stats.earned}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">BADGES EARNED</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                    {stats.total - stats.earned}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">IN PROGRESS</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-warning/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
                    {stats.completionPercentage}%
                  </div>
                  <p className="text-sm font-bold text-neutral-600">COMPLETION</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.length === 0 ? (
          <div className="col-span-full text-center p-8 text-neutral-600">
            No badges available yet. Start learning to earn badges!
          </div>
        ) : (
          badges.map((badge) => {
            const Icon = getBadgeIcon(badge)
            const colorScheme = getColorScheme(badge.points)

          return (
            <Card
              key={badge.id}
              className={`badge-item opacity-0 glass-effect concrete-texture border-4 relative overflow-hidden group ${
                badge.earned
                  ? 'border-success/40 hover:border-success/60'
                  : 'border-neutral-300 hover:border-neutral-400'
              } transition-all`}
            >
              {badge.earned && (
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
              )}

              <CardContent className="p-6 text-center">
                {/* Badge Icon */}
                <div className="relative mb-4">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${colorScheme} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform ${
                      !badge.earned && 'opacity-40 grayscale'
                    }`}
                  >
                    <Icon className="text-white" size={48} />
                  </div>

                  {badge.earned ? (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle className="text-white" size={16} />
                    </div>
                  ) : (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-full flex items-center justify-center border-2 border-white">
                      <Lock className="text-white" size={16} />
                    </div>
                  )}
                </div>

                {/* Badge Info */}
                <h3 className="text-xl font-black text-neutral-800 mb-2">{badge.name}</h3>
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{badge.description || 'Complete this challenge to earn the badge'}</p>

                {/* Points Badge */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-warning to-orange-600 text-white mb-3">
                  {badge.points} POINTS
                </span>

                {/* Progress or Earned Date */}
                {badge.earned ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-success">EARNED</p>
                    <p className="text-xs font-semibold text-neutral-500">{formatDate(badge.earnedDate)}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-primary">{Math.round(badge.progress)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.round(badge.progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">{getCriteriaText(badge)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
        )}
      </div>
    </div>
  )
}

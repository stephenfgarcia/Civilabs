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

interface Badge {
  id: number
  name: string
  description: string
  icon: any
  color: string
  earned: boolean
  earnedDate?: string
  progress?: number
  requirement: string
  category: string
}

// Mock badges data
const MOCK_BADGES: Badge[] = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: Star,
    color: 'from-warning to-orange-600',
    earned: true,
    earnedDate: 'January 10, 2024',
    requirement: 'Complete 1 lesson',
    category: 'Getting Started'
  },
  {
    id: 2,
    name: 'Course Crusher',
    description: 'Complete your first course',
    icon: Award,
    color: 'from-success to-green-600',
    earned: true,
    earnedDate: 'January 20, 2024',
    requirement: 'Complete 1 course',
    category: 'Completion'
  },
  {
    id: 3,
    name: 'Week Warrior',
    description: 'Maintain a 7-day learning streak',
    icon: Flame,
    color: 'from-danger to-red-600',
    earned: true,
    earnedDate: 'January 25, 2024',
    requirement: '7-day streak',
    category: 'Engagement'
  },
  {
    id: 4,
    name: 'Quiz Master',
    description: 'Pass 5 quizzes with 100% score',
    icon: Trophy,
    color: 'from-warning to-yellow-600',
    earned: false,
    progress: 60,
    requirement: 'Pass 5 quizzes with 100%',
    category: 'Assessment'
  },
  {
    id: 5,
    name: 'Speed Learner',
    description: 'Complete 10 lessons in one day',
    icon: Zap,
    color: 'from-primary to-blue-600',
    earned: false,
    progress: 40,
    requirement: 'Complete 10 lessons in 24 hours',
    category: 'Achievement'
  },
  {
    id: 6,
    name: 'Perfect Score',
    description: 'Achieve 100% on any quiz',
    icon: Target,
    color: 'from-success to-green-600',
    earned: false,
    progress: 0,
    requirement: 'Score 100% on 1 quiz',
    category: 'Assessment'
  },
  {
    id: 7,
    name: 'Dedication',
    description: 'Complete 30 days of learning',
    icon: Medal,
    color: 'from-secondary to-purple-600',
    earned: false,
    progress: 23,
    requirement: 'Learn for 30 consecutive days',
    category: 'Engagement'
  },
  {
    id: 8,
    name: 'Champion',
    description: 'Complete 10 courses',
    icon: Crown,
    color: 'from-warning to-orange-600',
    earned: false,
    progress: 10,
    requirement: 'Complete 10 courses',
    category: 'Completion'
  }
]

const CATEGORIES = ['All', 'Getting Started', 'Completion', 'Assessment', 'Engagement', 'Achievement']

export default function BadgesPage() {
  const [badges, setBadges] = useState(MOCK_BADGES)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.badge-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [selectedCategory])

  const filteredBadges = selectedCategory === 'All'
    ? badges
    : badges.filter(b => b.category === selectedCategory)

  const earnedCount = badges.filter(b => b.earned).length
  const totalCount = badges.length
  const earnedPercentage = Math.round((earnedCount / totalCount) * 100)

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
                    {earnedCount}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">BADGES EARNED</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                    {totalCount - earnedCount}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">IN PROGRESS</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-warning/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
                    {earnedPercentage}%
                  </div>
                  <p className="text-sm font-bold text-neutral-600">COMPLETION</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Card className="badge-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={20} />
            </div>
            FILTER BY CATEGORY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-lg font-bold transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                    : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBadges.map((badge) => {
          const Icon = badge.icon

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
                    className={`w-24 h-24 bg-gradient-to-br ${badge.color} rounded-full flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform ${
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
                <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{badge.description}</p>

                {/* Category Badge */}
                <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-secondary to-purple-600 text-white mb-3">
                  {badge.category}
                </span>

                {/* Progress or Earned Date */}
                {badge.earned ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-success">EARNED</p>
                    <p className="text-xs font-semibold text-neutral-500">{badge.earnedDate}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-primary">{badge.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${badge.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">{badge.requirement}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

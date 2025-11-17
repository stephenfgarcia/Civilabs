'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Medal, Award, Target, Zap, TrendingUp, Crown, Star, User } from 'lucide-react'

// Mock leaderboard data
const MOCK_LEADERBOARD = [
  {
    id: 1,
    rank: 1,
    name: 'Sarah Chen',
    department: 'Engineering',
    points: 2850,
    coursesCompleted: 12,
    certificates: 8,
    streak: 45,
    avatar: null,
    badge: 'Master Builder'
  },
  {
    id: 2,
    rank: 2,
    name: 'Mike Johnson',
    department: 'Operations',
    points: 2640,
    coursesCompleted: 10,
    certificates: 7,
    streak: 38,
    avatar: null,
    badge: 'Expert Learner'
  },
  {
    id: 3,
    rank: 3,
    name: 'John Martinez',
    department: 'Safety',
    points: 2520,
    coursesCompleted: 11,
    certificates: 6,
    streak: 32,
    avatar: null,
    badge: 'Safety Champion'
  },
  {
    id: 4,
    rank: 4,
    name: 'Emily Rodriguez',
    department: 'Engineering',
    points: 2380,
    coursesCompleted: 9,
    certificates: 6,
    streak: 28,
    avatar: null,
    badge: 'Rising Star'
  },
  {
    id: 5,
    rank: 5,
    name: 'David Kim',
    department: 'Quality',
    points: 2210,
    coursesCompleted: 8,
    certificates: 5,
    streak: 25,
    avatar: null,
    badge: 'Dedicated Learner'
  },
  {
    id: 6,
    rank: 6,
    name: 'Lisa Thompson',
    department: 'Operations',
    points: 2050,
    coursesCompleted: 7,
    certificates: 5,
    streak: 22,
    avatar: null,
    badge: 'Consistent'
  },
  {
    id: 7,
    rank: 7,
    name: 'James Wilson',
    department: 'Engineering',
    points: 1890,
    coursesCompleted: 6,
    certificates: 4,
    streak: 18,
    avatar: null,
    badge: 'On Track'
  },
  {
    id: 8,
    rank: 8,
    name: 'You',
    department: 'Engineering',
    points: 1750,
    coursesCompleted: 5,
    certificates: 3,
    streak: 7,
    avatar: null,
    badge: 'Getting Started',
    isCurrentUser: true
  }
]

const FILTER_TABS = [
  { id: 'all', label: 'ALL TIME', icon: Trophy },
  { id: 'month', label: 'THIS MONTH', icon: TrendingUp },
  { id: 'week', label: 'THIS WEEK', icon: Zap },
  { id: 'department', label: 'MY DEPARTMENT', icon: Target }
]

export default function LeaderboardPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [leaderboard, setLeaderboard] = useState(MOCK_LEADERBOARD)

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.leaderboard-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-warning" size={32} />
      case 2:
        return <Medal className="text-neutral-400" size={28} />
      case 3:
        return <Medal className="text-orange-600" size={28} />
      default:
        return <span className="text-2xl font-black text-neutral-400">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-warning to-orange-600'
      case 2:
        return 'from-neutral-300 to-neutral-500'
      case 3:
        return 'from-orange-500 to-orange-700'
      default:
        return 'from-primary to-blue-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="leaderboard-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              LEADERBOARD
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Compete with your peers and track your ranking
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <Trophy className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Card className="leaderboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_TABS.map(filter => {
              const IconComponent = filter.icon
              const isActive = selectedFilter === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg'
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                  }`}
                >
                  <IconComponent size={16} />
                  {filter.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="leaderboard-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 2nd Place */}
        <Card className="glass-effect concrete-texture border-4 border-neutral-300 relative order-2 md:order-1">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-neutral-300 to-neutral-500"></div>
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-neutral-300 to-neutral-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Medal className="text-white" size={40} />
            </div>
            <div className="text-6xl font-black text-neutral-400 mb-2">#2</div>
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="text-white" size={32} />
            </div>
            <h3 className="text-lg font-black text-neutral-800">{leaderboard[1]?.name}</h3>
            <p className="text-xs text-neutral-600 mb-3">{leaderboard[1]?.department}</p>
            <div className="glass-effect border-2 border-neutral-200 rounded-lg p-3">
              <p className="text-3xl font-black bg-gradient-to-r from-neutral-400 to-neutral-600 bg-clip-text text-transparent">
                {leaderboard[1]?.points}
              </p>
              <p className="text-xs font-bold text-neutral-600 uppercase">Points</p>
            </div>
          </CardContent>
        </Card>

        {/* 1st Place */}
        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative order-1 md:order-2 md:scale-105">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-orange-600"></div>
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-warning to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Crown className="text-white" size={48} />
            </div>
            <div className="text-6xl font-black text-warning mb-2">#1</div>
            <div className="w-20 h-20 bg-gradient-to-br from-warning to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="text-white" size={40} />
            </div>
            <h3 className="text-xl font-black text-neutral-800">{leaderboard[0]?.name}</h3>
            <p className="text-sm text-neutral-600 mb-3">{leaderboard[0]?.department}</p>
            <div className="glass-effect border-2 border-warning/30 rounded-lg p-4">
              <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">
                {leaderboard[0]?.points}
              </p>
              <p className="text-xs font-bold text-neutral-600 uppercase">Points</p>
            </div>
            <div className="mt-3 flex items-center justify-center gap-1">
              <Star className="text-warning" size={16} fill="currentColor" />
              <Star className="text-warning" size={16} fill="currentColor" />
              <Star className="text-warning" size={16} fill="currentColor" />
            </div>
          </CardContent>
        </Card>

        {/* 3rd Place */}
        <Card className="glass-effect concrete-texture border-4 border-orange-300 relative order-3">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-orange-700"></div>
          <CardContent className="pt-8 pb-6 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Medal className="text-white" size={40} />
            </div>
            <div className="text-6xl font-black text-orange-600 mb-2">#3</div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="text-white" size={32} />
            </div>
            <h3 className="text-lg font-black text-neutral-800">{leaderboard[2]?.name}</h3>
            <p className="text-xs text-neutral-600 mb-3">{leaderboard[2]?.department}</p>
            <div className="glass-effect border-2 border-orange-200 rounded-lg p-3">
              <p className="text-3xl font-black bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">
                {leaderboard[2]?.points}
              </p>
              <p className="text-xs font-bold text-neutral-600 uppercase">Points</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Leaderboard List */}
      <Card className="leaderboard-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Trophy className="text-white" size={20} />
            </div>
            FULL RANKINGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div
                key={user.id}
                className={`glass-effect border-2 rounded-lg p-4 transition-all ${
                  user.isCurrentUser
                    ? 'border-warning/60 bg-warning/5'
                    : 'border-neutral-200 hover:border-primary/40'
                }`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-2 md:col-span-1 flex items-center justify-center">
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${getRankColor(user.rank)} rounded-xl flex items-center justify-center`}>
                      {user.rank <= 3 ? (
                        getRankIcon(user.rank)
                      ) : (
                        <span className="text-xl md:text-2xl font-black text-white">#{user.rank}</span>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="col-span-10 md:col-span-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(user.rank)} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <User className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-neutral-800 flex items-center gap-2">
                          {user.name}
                          {user.isCurrentUser && (
                            <span className="text-xs font-bold px-2 py-1 rounded-full bg-warning/20 text-warning">YOU</span>
                          )}
                        </h3>
                        <p className="text-xs text-neutral-600">{typeof user.department === 'string' ? user.department : user.department?.name || 'N/A'}</p>
                        <p className="text-xs font-semibold text-primary mt-1">{user.badge}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="col-span-12 md:col-span-6 grid grid-cols-4 gap-2">
                    <div className="glass-effect border border-primary/20 rounded-lg p-2 text-center">
                      <p className="text-lg md:text-2xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {user.points}
                      </p>
                      <p className="text-xs font-bold text-neutral-600">Points</p>
                    </div>
                    <div className="glass-effect border border-success/20 rounded-lg p-2 text-center">
                      <p className="text-lg md:text-2xl font-black text-success">{user.coursesCompleted}</p>
                      <p className="text-xs font-bold text-neutral-600">Courses</p>
                    </div>
                    <div className="glass-effect border border-warning/20 rounded-lg p-2 text-center">
                      <p className="text-lg md:text-2xl font-black text-warning">{user.certificates}</p>
                      <p className="text-xs font-bold text-neutral-600">Certs</p>
                    </div>
                    <div className="glass-effect border border-danger/20 rounded-lg p-2 text-center">
                      <p className="text-lg md:text-2xl font-black text-danger">{user.streak}</p>
                      <p className="text-xs font-bold text-neutral-600">Streak</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Stats Summary */}
      <Card className="leaderboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <Target className="text-white" size={20} />
            </div>
            YOUR RANKING STATS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 text-center">
              <Award className="mx-auto text-primary mb-2" size={32} />
              <p className="text-3xl font-black text-primary">8th</p>
              <p className="text-sm font-bold text-neutral-600 mt-1">Current Rank</p>
            </div>
            <div className="glass-effect border-2 border-success/20 rounded-lg p-4 text-center">
              <TrendingUp className="mx-auto text-success mb-2" size={32} />
              <p className="text-3xl font-black text-success">+3</p>
              <p className="text-sm font-bold text-neutral-600 mt-1">This Week</p>
            </div>
            <div className="glass-effect border-2 border-warning/20 rounded-lg p-4 text-center">
              <Zap className="mx-auto text-warning mb-2" size={32} />
              <p className="text-3xl font-black text-warning">250</p>
              <p className="text-sm font-bold text-neutral-600 mt-1">Points to #7</p>
            </div>
            <div className="glass-effect border-2 border-secondary/20 rounded-lg p-4 text-center">
              <Trophy className="mx-auto text-secondary mb-2" size={32} />
              <p className="text-3xl font-black text-secondary">Top 20%</p>
              <p className="text-sm font-bold text-neutral-600 mt-1">Percentile</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

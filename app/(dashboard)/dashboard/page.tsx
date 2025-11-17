'use client'

import { useEffect, useState } from 'react'
import anime from 'animejs'
import { AnimatedCard } from '@/components/ui/animated-card'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimatedButton } from '@/components/ui/animated-button'
import { BookOpen, Award, Clock, TrendingUp, Sparkles, Target, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    // Animate page elements
    anime.timeline()
      .add({
        targets: '.welcome-banner',
        opacity: [0, 1],
        translateY: [-30, 0],
        scale: [0.95, 1],
        duration: 800,
        easing: 'easeOutCubic',
      })
      .add({
        targets: '.stat-card',
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.9, 1],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutCubic',
      }, '-=400')
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="welcome-banner opacity-0">
        <div className="glass-effect rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-purple-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="animate-pulse" size={32} />
              <h1 className="text-4xl md:text-5xl font-bold">
                Welcome back, {user?.firstName}!
              </h1>
            </div>
            <p className="text-xl text-white/90 mb-6 max-w-2xl">
              Continue your learning journey and unlock new achievements today
            </p>
            <Link href="/courses">
              <AnimatedButton className="bg-white text-primary hover:bg-white/90 hover:scale-105 transition-transform">
                <Zap className="mr-2" />
                Browse Courses
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatedCard delay={100} className="stat-card opacity-0 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Enrolled Courses
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">0</div>
            <p className="text-sm text-neutral-500 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-success" />
              0 in progress
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={200} className="stat-card opacity-0 border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Completed
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">0</div>
            <p className="text-sm text-neutral-500 mt-2 flex items-center gap-1">
              <Award size={14} className="text-warning" />
              0 certificates earned
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={300} className="stat-card opacity-0 border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Learning Time
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">0h</div>
            <p className="text-sm text-neutral-500 mt-2">
              Total time spent
            </p>
          </CardContent>
        </AnimatedCard>

        <AnimatedCard delay={400} className="stat-card opacity-0 border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-neutral-600">
              Current Streak
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <Target className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold gradient-text">0</div>
            <p className="text-sm text-neutral-500 mt-2">
              Days in a row
            </p>
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Continue Learning */}
      <AnimatedCard delay={500}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="text-primary" />
            Continue Learning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen size={48} className="text-primary opacity-50" />
            </div>
            <p className="text-xl font-semibold text-neutral-700 mb-2">No courses in progress</p>
            <p className="text-neutral-500 mb-6">Start learning by enrolling in a course</p>
            <Link href="/courses">
              <AnimatedButton className="bg-gradient-to-r from-primary to-secondary text-white">
                Browse Course Catalog
              </AnimatedButton>
            </Link>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Recommended Courses */}
      <AnimatedCard delay={600}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="text-secondary" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={40} className="text-secondary opacity-50" />
            </div>
            <p className="text-neutral-500">Recommendations will appear based on your interests</p>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  )
}

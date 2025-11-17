'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Award, Clock, TrendingUp, HardHat, Target, Zap, AlertCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    enrolled: 3,
    inProgress: 2,
    completed: 5,
    certificates: 3,
    learningHours: 24,
    streak: 7
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.dashboard-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.1}s`
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="dashboard-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-warning/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          {/* Construction background */}
          <div className="absolute inset-0 bg-gradient-to-r from-warning via-primary to-success opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <HardHat className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
                  WELCOME BACK, {user?.firstName?.toUpperCase() || 'WORKER'}!
                </h1>
                <p className="text-sm font-bold text-neutral-600 mt-1">CONSTRUCTION TRAINING IN PROGRESS</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-neutral-700 mb-6 max-w-2xl">
              Continue building your skills and unlock new certifications today
            </p>
            <Link href="/courses">
              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                <Zap className="mr-2" />
                BROWSE TRAINING COURSES
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Enrolled Courses
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">{stats.enrolled}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <TrendingUp size={14} className="text-success" />
              {stats.inProgress} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Completed
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Award className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">{stats.completed}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2 flex items-center gap-1">
              <Award size={14} className="text-warning" />
              {stats.certificates} certificates earned
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-secondary to-purple-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Learning Time
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent">{stats.learningHours}h</div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              Total training time
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-neutral-700 uppercase">
              Current Streak
            </CardTitle>
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Target className="text-white" size={24} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent">{stats.streak}</div>
            <p className="text-sm font-bold text-neutral-600 mt-2">
              Days in a row 🔥
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              CONTINUE TRAINING
            </CardTitle>
            <Link href="/my-learning">
              <span className="text-sm font-bold text-primary hover:text-primary/80 flex items-center gap-1">
                View All <ChevronRight size={16} />
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mock course cards */}
            <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HardHat className="text-primary" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-800">Safety Fundamentals</h3>
                  <p className="text-xs text-neutral-600 mt-1">Construction Safety Basics</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-primary">65%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-effect border-2 border-success/20 rounded-lg p-4 hover:border-success/40 transition-colors">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="text-success" size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-800">Equipment Operation</h3>
                  <p className="text-xs text-neutral-600 mt-1">Heavy Machinery Training</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-neutral-600">Progress</span>
                      <span className="text-success">30%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-success to-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="dashboard-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={20} />
            </div>
            QUICK ACTIONS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/courses">
              <div className="glass-effect border-2 border-warning/30 rounded-lg p-6 hover:border-warning hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">BROWSE COURSES</h3>
                <p className="text-sm text-neutral-600">Explore available training</p>
              </div>
            </Link>

            <Link href="/certificates">
              <div className="glass-effect border-2 border-success/30 rounded-lg p-6 hover:border-success hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">MY CERTIFICATES</h3>
                <p className="text-sm text-neutral-600">View earned credentials</p>
              </div>
            </Link>

            <Link href="/help">
              <div className="glass-effect border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertCircle className="text-white" size={24} />
                </div>
                <h3 className="font-black text-neutral-800 mb-1">GET HELP</h3>
                <p className="text-sm text-neutral-600">Support and resources</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Award, Clock, TrendingUp, HardHat, Shield, Wrench, Play, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import Link from 'next/link'

// Mock enrolled courses data - matches dashboard stats (3 enrolled, 2 in progress)
const MOCK_ENROLLED_COURSES = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    description: 'Essential safety protocols and procedures for construction sites',
    category: 'Safety',
    level: 'Beginner',
    duration: '4 hours',
    progress: 65,
    status: 'in_progress',
    icon: Shield,
    color: 'from-danger to-red-600',
    lastAccessed: '2 hours ago',
    nextLesson: 'Module 3: Personal Protective Equipment'
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    description: 'Learn to operate excavators, bulldozers, and cranes safely',
    category: 'Equipment',
    level: 'Intermediate',
    duration: '12 hours',
    progress: 30,
    status: 'in_progress',
    icon: Wrench,
    color: 'from-warning to-orange-600',
    lastAccessed: '1 day ago',
    nextLesson: 'Module 2: Excavator Controls'
  },
  {
    id: 3,
    title: 'Blueprint Reading & Interpretation',
    description: 'Master the art of reading construction blueprints and technical drawings',
    category: 'Technical',
    level: 'Beginner',
    duration: '6 hours',
    progress: 0,
    status: 'not_started',
    icon: BookOpen,
    color: 'from-primary to-blue-600',
    lastAccessed: 'Not started',
    nextLesson: 'Module 1: Introduction to Blueprints'
  }
]

const STATUS_FILTERS = [
  { id: 'all', label: 'ALL COURSES', icon: Filter },
  { id: 'in_progress', label: 'IN PROGRESS', icon: Play },
  { id: 'completed', label: 'COMPLETED', icon: CheckCircle },
  { id: 'not_started', label: 'NOT STARTED', icon: AlertCircle }
]

export default function MyLearningPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [filteredCourses, setFilteredCourses] = useState(MOCK_ENROLLED_COURSES)

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.learning-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  useEffect(() => {
    // Filter courses by status
    if (selectedStatus === 'all') {
      setFilteredCourses(MOCK_ENROLLED_COURSES)
    } else {
      setFilteredCourses(MOCK_ENROLLED_COURSES.filter(course => course.status === selectedStatus))
    }
  }, [selectedStatus])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">IN PROGRESS</span>
      case 'completed':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success">COMPLETED</span>
      case 'not_started':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-200 text-neutral-600">NOT STARTED</span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="learning-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-warning to-success bg-clip-text text-transparent">
              MY LEARNING
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Track your progress and continue training
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="learning-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Total Enrolled</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1">
                  {MOCK_ENROLLED_COURSES.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">In Progress</p>
                <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mt-1">
                  {MOCK_ENROLLED_COURSES.filter(c => c.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <Play className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Completed</p>
                <p className="text-4xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mt-1">
                  0
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(filter => {
              const IconComponent = filter.icon
              const isActive = selectedStatus === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedStatus(filter.id)}
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

      {/* Course List */}
      {filteredCourses.length > 0 ? (
        <div className="space-y-4">
          {filteredCourses.map((course, index) => {
            const IconComponent = course.icon
            return (
              <Card
                key={course.id}
                className="learning-item opacity-0 glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden"
              >
                {/* Accent Bar */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${course.color}`}></div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Course Info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="text-white" size={32} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-black text-neutral-800 group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-sm text-neutral-600 mt-1">{course.description}</p>
                            </div>
                            {getStatusBadge(course.status)}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                                <Award className="text-warning" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{course.level}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="text-primary" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="text-neutral-600" size={16} />
                              </div>
                              <span className="text-sm font-semibold text-neutral-700">{course.category}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="lg:col-span-5">
                      <div className="h-full flex flex-col justify-between">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-neutral-600">PROGRESS</span>
                            <span className={`text-lg font-black ${course.progress === 100 ? 'text-success' : 'text-primary'}`}>
                              {course.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-3 mb-3">
                            <div
                              className={`bg-gradient-to-r ${course.color} h-3 rounded-full transition-all`}
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          {course.nextLesson && (
                            <div className="glass-effect border-2 border-primary/20 rounded-lg p-3 mb-3">
                              <p className="text-xs font-bold text-neutral-600 mb-1">NEXT LESSON</p>
                              <p className="text-sm font-semibold text-neutral-800">{course.nextLesson}</p>
                            </div>
                          )}
                          <p className="text-xs text-neutral-500">Last accessed: {course.lastAccessed}</p>
                        </div>

                        {/* Action Button */}
                        <MagneticButton
                          className={`w-full mt-4 ${
                            course.status === 'not_started'
                              ? 'bg-gradient-to-r from-success to-green-600'
                              : 'bg-gradient-to-r from-primary to-blue-600'
                          } text-white font-black flex items-center justify-center gap-2`}
                        >
                          {course.status === 'not_started' ? (
                            <>
                              <Play size={18} />
                              START COURSE
                            </>
                          ) : course.status === 'completed' ? (
                            <>
                              <BookOpen size={18} />
                              REVIEW COURSE
                            </>
                          ) : (
                            <>
                              <Play size={18} />
                              CONTINUE LEARNING
                            </>
                          )}
                        </MagneticButton>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="learning-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="text-neutral-400" size={48} />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-6">
              {selectedStatus === 'all'
                ? "You haven't enrolled in any courses yet"
                : `You don't have any ${selectedStatus.replace('_', ' ')} courses`}
            </p>
            {selectedStatus === 'all' ? (
              <Link href="/courses">
                <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                  <BookOpen className="mr-2" size={18} />
                  BROWSE COURSES
                </MagneticButton>
              </Link>
            ) : (
              <MagneticButton
                onClick={() => setSelectedStatus('all')}
                className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
              >
                VIEW ALL COURSES
              </MagneticButton>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

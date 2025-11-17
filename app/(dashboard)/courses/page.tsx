'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { BookOpen, Search, Filter, HardHat, Award, Clock, Users, ChevronRight, Zap, Shield, Wrench } from 'lucide-react'
import Link from 'next/link'

// Mock course data
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    description: 'Essential safety protocols and procedures for construction sites',
    category: 'Safety',
    level: 'Beginner',
    duration: '4 hours',
    students: 245,
    icon: Shield,
    color: 'from-danger to-red-600'
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    description: 'Learn to operate excavators, bulldozers, and cranes safely',
    category: 'Equipment',
    level: 'Intermediate',
    duration: '12 hours',
    students: 189,
    icon: Wrench,
    color: 'from-warning to-orange-600'
  },
  {
    id: 3,
    title: 'Blueprint Reading & Interpretation',
    description: 'Master the art of reading construction blueprints and technical drawings',
    category: 'Technical',
    level: 'Beginner',
    duration: '6 hours',
    students: 312,
    icon: BookOpen,
    color: 'from-primary to-blue-600'
  },
  {
    id: 4,
    title: 'Project Management Essentials',
    description: 'Essential skills for managing construction projects effectively',
    category: 'Management',
    level: 'Advanced',
    duration: '10 hours',
    students: 156,
    icon: HardHat,
    color: 'from-success to-green-600'
  },
  {
    id: 5,
    title: 'Quality Control & Inspection',
    description: 'Learn industry standards for quality control and site inspection',
    category: 'Quality',
    level: 'Intermediate',
    duration: '8 hours',
    students: 201,
    icon: Award,
    color: 'from-secondary to-purple-600'
  },
  {
    id: 6,
    title: 'Electrical Systems Installation',
    description: 'Comprehensive guide to electrical systems in construction',
    category: 'Technical',
    level: 'Advanced',
    duration: '15 hours',
    students: 134,
    icon: Zap,
    color: 'from-warning to-yellow-600'
  }
]

const CATEGORIES = ['All', 'Safety', 'Equipment', 'Technical', 'Management', 'Quality']
const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [filteredCourses, setFilteredCourses] = useState(MOCK_COURSES)

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.courses-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  useEffect(() => {
    // Filter courses
    let filtered = MOCK_COURSES

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    if (selectedLevel !== 'All Levels') {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, selectedCategory, selectedLevel])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="courses-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              TRAINING CATALOG
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Browse available construction training courses
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <Input
                type="text"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 glass-effect border-2 border-warning/30 focus:border-warning text-base font-medium"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                  <Filter size={16} className="text-warning" />
                  CATEGORY
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 glass-effect border-2 border-warning/30 focus:border-warning rounded-lg px-4 font-medium"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                  <Award size={16} className="text-warning" />
                  SKILL LEVEL
                </label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full h-12 glass-effect border-2 border-warning/30 focus:border-warning rounded-lg px-4 font-medium"
                >
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-bold text-neutral-600">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </p>
              {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All Levels') && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setSelectedLevel('All Levels')
                  }}
                  className="text-sm font-bold text-danger hover:text-danger/80"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => {
            const IconComponent = course.icon
            return (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card
                  className="courses-item opacity-0 glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden cursor-pointer"
                >
                  {/* Accent Bar */}
                  <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${course.color}`}></div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <IconComponent className="text-white" size={28} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">
                          {course.category}
                        </span>
                        <span className="text-xs font-semibold text-neutral-600">
                          {course.level}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-black mt-4 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-600 text-sm mb-6 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="text-primary" size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Duration</p>
                          <p className="text-sm font-bold text-neutral-800">{course.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                          <Users className="text-success" size={16} />
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500">Students</p>
                          <p className="text-sm font-bold text-neutral-800">{course.students}</p>
                        </div>
                      </div>
                    </div>

                    {/* View Course Button */}
                    <div className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center justify-center gap-2 py-3 rounded-lg">
                      VIEW COURSE
                      <ChevronRight size={18} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-neutral-400" size={48} />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-6">
              Try adjusting your search or filters
            </p>
            <MagneticButton
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
                setSelectedLevel('All Levels')
              }}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
            >
              Reset Filters
            </MagneticButton>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

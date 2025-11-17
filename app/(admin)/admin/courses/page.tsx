'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Course {
  id: number
  title: string
  category: string
  instructor: string
  status: 'published' | 'draft' | 'archived'
  enrollments: number
  completions: number
  rating: number
  duration: string
  lessons: number
  createdDate: string
  lastUpdated: string
}

const MOCK_COURSES: Course[] = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    category: 'Safety',
    instructor: 'John Martinez',
    status: 'published',
    enrollments: 245,
    completions: 189,
    rating: 4.8,
    duration: '4 hours',
    lessons: 12,
    createdDate: '2024-01-10',
    lastUpdated: '2 days ago',
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    category: 'Equipment',
    instructor: 'Mike Johnson',
    status: 'published',
    enrollments: 189,
    completions: 145,
    rating: 4.6,
    duration: '12 hours',
    lessons: 24,
    createdDate: '2024-01-15',
    lastUpdated: '1 week ago',
  },
  {
    id: 3,
    title: 'Advanced Welding Techniques',
    category: 'Technical Skills',
    instructor: 'Sarah Chen',
    status: 'draft',
    enrollments: 0,
    completions: 0,
    rating: 0,
    duration: '8 hours',
    lessons: 16,
    createdDate: '2024-03-01',
    lastUpdated: '1 hour ago',
  },
]

const STATUSES = ['All', 'Published', 'Draft', 'Archived']
const CATEGORIES = ['All', 'Safety', 'Equipment', 'Technical Skills', 'Management']

export default function CoursesPage() {
  const [courses, setCourses] = useState(MOCK_COURSES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    const elements = document.querySelectorAll('.courses-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || course.status === selectedStatus.toLowerCase()
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'from-success to-green-600'
      case 'draft':
        return 'from-warning to-orange-600'
      case 'archived':
        return 'from-neutral-400 to-neutral-600'
      default:
        return 'from-primary to-blue-600'
    }
  }

  const completionRate = (enrollments: number, completions: number) => {
    if (enrollments === 0) return 0
    return Math.round((completions / enrollments) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="courses-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-success/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-success/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-success/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-success/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-success/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-success via-green-500 to-emerald-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-success via-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                  COURSE MANAGEMENT
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Create, edit, and manage courses
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                <Plus className="mr-2" size={20} />
                CREATE COURSE
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {courses.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL COURSES</p>
          </CardContent>
        </Card>

        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">PUBLISHED</p>
          </CardContent>
        </Card>

        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {courses.reduce((acc, c) => acc + c.enrollments, 0)}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL ENROLLMENTS</p>
          </CardContent>
        </Card>

        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {courses.filter(c => c.status === 'draft').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">DRAFTS</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-success to-green-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-success/30 text-neutral-700 hover:border-success/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">CATEGORY</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourses.map((course) => (
          <Card
            key={course.id}
            className="courses-item opacity-0 glass-effect concrete-texture border-4 border-success/20 hover:border-success/40 transition-all group"
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(course.status)} text-white font-black text-xs uppercase`}>
                        {course.status}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                        {course.category}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-neutral-800 mb-2 group-hover:text-success transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm font-semibold text-neutral-600">
                      Instructor: {course.instructor}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y-2 border-neutral-200">
                  <div className="text-center">
                    <Users className="mx-auto mb-1 text-primary" size={20} />
                    <p className="font-black text-neutral-800">{course.enrollments}</p>
                    <p className="text-xs text-neutral-600">Students</p>
                  </div>
                  <div className="text-center">
                    <CheckCircle className="mx-auto mb-1 text-success" size={20} />
                    <p className="font-black text-neutral-800">{completionRate(course.enrollments, course.completions)}%</p>
                    <p className="text-xs text-neutral-600">Completion</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="mx-auto mb-1 text-warning" size={20} />
                    <p className="font-black text-neutral-800">{course.rating > 0 ? course.rating : 'N/A'}</p>
                    <p className="text-xs text-neutral-600">Rating</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center justify-between text-sm text-neutral-600">
                  <div className="flex items-center gap-1">
                    <BookOpen size={14} />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{course.duration}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <MagneticButton className="flex-1 glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                    <Eye className="mr-2" size={16} />
                    VIEW
                  </MagneticButton>
                  <MagneticButton className="flex-1 glass-effect border-2 border-success/30 text-neutral-700 font-black hover:border-success/60">
                    <Edit className="mr-2" size={16} />
                    EDIT
                  </MagneticButton>
                  <button className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all">
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>

                {/* Footer */}
                <div className="text-xs text-neutral-500 pt-2">
                  Updated: {course.lastUpdated}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

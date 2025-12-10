/**
 * Instructor My Courses Page
 * View and manage instructor's courses
 */

'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  BookOpen,
  Users,
  Star,
  TrendingUp,
  Eye,
  Edit,
  Copy,
  Archive,
  Search,
  Plus,
  Filter,
  MoreVertical,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { instructorService, type InstructorCourse } from '@/lib/services'

export default function InstructorMyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCourses()
  }, [statusFilter])

  async function fetchCourses() {
    try {
      setLoading(true)
      setError(null)
      const params: any = {}
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase()
      }
      const data = await instructorService.getCourses(params)
      setCourses(data.courses)
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === 'PUBLISHED').length,
    draft: courses.filter((c) => c.status === 'DRAFT').length,
    totalStudents: courses.reduce((sum, c) => sum + c.metrics.totalEnrollments, 0),
    avgCompletion: courses.length > 0
      ? Math.round(
          courses.reduce((sum, c) => sum + c.metrics.completionRate, 0) / courses.length
        )
      : 0,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-success/10 text-success'
      case 'DRAFT':
        return 'bg-warning/10 text-warning'
      case 'ARCHIVED':
        return 'bg-neutral-200 text-neutral-600'
      default:
        return 'bg-neutral-200 text-neutral-600'
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-warning mx-auto mb-4" />
          <p className="text-lg font-bold text-neutral-600">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 border-4 border-danger/40 max-w-md">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Failed to Load</h2>
            <p className="text-neutral-600 mb-4">{error}</p>
            <MagneticButton
              onClick={fetchCourses}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
            >
              TRY AGAIN
            </MagneticButton>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-600 bg-clip-text text-transparent">
            MY COURSES
          </h1>
          <p className="text-neutral-600 font-medium mt-2">
            Manage and monitor your course catalog
          </p>
        </div>

        <Link href="/instructor/my-courses/request">
          <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
            <Plus className="mr-2" size={20} />
            REQUEST COURSE
          </MagneticButton>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="p-6 border-4 border-neutral-200">
          <p className="text-sm font-bold text-neutral-600 mb-1">Total Courses</p>
          <p className="text-3xl font-black text-neutral-800">{stats.total}</p>
        </Card>
        <Card className="p-6 border-4 border-success/40">
          <p className="text-sm font-bold text-neutral-600 mb-1">Published</p>
          <p className="text-3xl font-black text-success">{stats.published}</p>
        </Card>
        <Card className="p-6 border-4 border-warning/40">
          <p className="text-sm font-bold text-neutral-600 mb-1">Drafts</p>
          <p className="text-3xl font-black text-warning">{stats.draft}</p>
        </Card>
        <Card className="p-6 border-4 border-primary/40">
          <p className="text-sm font-bold text-neutral-600 mb-1">Total Students</p>
          <p className="text-3xl font-black text-primary">{stats.totalStudents}</p>
        </Card>
        <Card className="p-6 border-4 border-secondary/40">
          <p className="text-sm font-bold text-neutral-600 mb-1">Avg Completion</p>
          <p className="text-3xl font-black text-secondary">{stats.avgCompletion}%</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-4 border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-warning to-orange-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                statusFilter === 'published'
                  ? 'bg-gradient-to-r from-success to-green-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Published
            </button>
            <button
              onClick={() => setStatusFilter('draft')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                statusFilter === 'draft'
                  ? 'bg-gradient-to-r from-warning to-orange-600 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </Card>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="p-12 border-4 border-neutral-200 text-center">
          <BookOpen className="mx-auto text-neutral-400 mb-4" size={48} />
          <p className="text-lg font-bold text-neutral-600">No courses found</p>
          <p className="text-neutral-500 font-medium mt-2">
            {searchQuery
              ? 'Try adjusting your search or filters'
              : courses.length === 0
              ? 'Create your first course to get started'
              : 'No courses match the selected filter'}
          </p>
          {courses.length === 0 && (
            <Link href="/instructor/my-courses/request" className="inline-block mt-4">
              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                <Plus className="mr-2" size={20} />
                REQUEST YOUR FIRST COURSE
              </MagneticButton>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="p-6 border-4 border-neutral-200 hover:border-warning/40 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                  {course.category?.name.charAt(0) || '📚'}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2 py-1 rounded ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                  <button className="text-neutral-600 hover:text-neutral-800">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-black text-neutral-800 mb-2 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-sm font-medium text-neutral-600 mb-4">
                {course.category?.name || 'Uncategorized'}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-600 flex items-center gap-2">
                    <Users size={16} />
                    Students
                  </span>
                  <span className="font-black text-neutral-800">
                    {course.metrics.totalEnrollments}
                  </span>
                </div>

                {course.status === 'PUBLISHED' && course.metrics.totalEnrollments > 0 && (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-600 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Active
                      </span>
                      <span className="font-black text-success">
                        {course.metrics.activeEnrollments}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium text-neutral-600">Completion</span>
                        <span className="font-black text-neutral-800">
                          {course.metrics.completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                          style={{ width: `${course.metrics.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-neutral-600 flex items-center gap-2">
                    <BookOpen size={16} />
                    Lessons
                  </span>
                  <span className="font-black text-neutral-800">
                    {course.metrics.totalLessons}
                  </span>
                </div>
              </div>

              <p className="text-xs text-neutral-600 font-medium mb-4">
                Last updated {getRelativeTime(course.updatedAt)}
              </p>

              <div className="flex items-center gap-2">
                <Link href={`/courses/${course.id}`} className="flex-1">
                  <MagneticButton className="w-full glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60 text-sm py-2">
                    <Eye className="mr-2" size={16} />
                    VIEW
                  </MagneticButton>
                </Link>
                <MagneticButton
                  onClick={() => {
                    // TODO: Implement instructor course editing
                    // For now, instructors should contact admin to edit courses
                  }}
                  disabled
                  className="flex-1 w-full bg-gradient-to-r from-neutral-400 to-neutral-600 text-white font-black text-sm py-2 opacity-50 cursor-not-allowed"
                  title="Contact admin to edit course details"
                >
                  <Edit className="mr-2" size={16} />
                  EDIT
                </MagneticButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

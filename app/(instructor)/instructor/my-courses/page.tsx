/**
 * Instructor My Courses Page
 * View and manage instructor's courses
 */

'use client'

import { useState } from 'react'
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
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'

export default function InstructorMyCoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Mock data
  const courses = [
    {
      id: 1,
      title: 'Construction Safety 101',
      status: 'published',
      students: 45,
      rating: 4.9,
      reviews: 23,
      revenue: '$2,250',
      completion: 92,
      lastUpdated: '2 days ago',
      thumbnail: '🏗️',
      category: 'Safety',
    },
    {
      id: 2,
      title: 'Equipment Operation Fundamentals',
      status: 'published',
      students: 38,
      rating: 4.7,
      reviews: 19,
      revenue: '$1,900',
      completion: 85,
      lastUpdated: '1 week ago',
      thumbnail: '🚜',
      category: 'Equipment',
    },
    {
      id: 3,
      title: 'Quality Control Basics',
      status: 'published',
      students: 32,
      rating: 4.8,
      reviews: 16,
      revenue: '$1,600',
      completion: 88,
      lastUpdated: '3 days ago',
      thumbnail: '✅',
      category: 'Quality',
    },
    {
      id: 4,
      title: 'Advanced Blueprint Reading',
      status: 'draft',
      students: 0,
      rating: 0,
      reviews: 0,
      revenue: '$0',
      completion: 0,
      lastUpdated: '1 day ago',
      thumbnail: '📐',
      category: 'Technical',
    },
    {
      id: 5,
      title: 'Site Management Essentials',
      status: 'published',
      students: 28,
      rating: 4.6,
      reviews: 14,
      revenue: '$1,400',
      completion: 79,
      lastUpdated: '2 weeks ago',
      thumbnail: '👷',
      category: 'Management',
    },
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 'published').length,
    draft: courses.filter(c => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, c) => sum + c.students, 0),
    totalRevenue: courses.reduce((sum, c) => sum + parseFloat(c.revenue.replace('$', '').replace(',', '')), 0),
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

        <Link href="/instructor/courses/create">
          <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
            <Plus className="mr-2" size={20} />
            CREATE COURSE
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
          <p className="text-sm font-bold text-neutral-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-black text-secondary">${stats.totalRevenue.toLocaleString()}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 border-4 border-neutral-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="p-6 border-4 border-neutral-200 hover:border-warning/40 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center text-3xl shadow-lg">
                {course.thumbnail}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2 py-1 rounded ${
                  course.status === 'published'
                    ? 'bg-success/10 text-success'
                    : 'bg-warning/10 text-warning'
                }`}>
                  {course.status.toUpperCase()}
                </span>
                <button className="text-neutral-600 hover:text-neutral-800">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-black text-neutral-800 mb-2">{course.title}</h3>
            <p className="text-sm font-medium text-neutral-600 mb-4">{course.category}</p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-600 flex items-center gap-2">
                  <Users size={16} />
                  Students
                </span>
                <span className="font-black text-neutral-800">{course.students}</span>
              </div>

              {course.status === 'published' && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-600 flex items-center gap-2">
                      <Star size={16} />
                      Rating
                    </span>
                    <span className="font-black text-neutral-800">{course.rating} ({course.reviews})</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-600 flex items-center gap-2">
                      <TrendingUp size={16} />
                      Revenue
                    </span>
                    <span className="font-black text-success">{course.revenue}</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-neutral-600">Completion</span>
                      <span className="font-black text-neutral-800">{course.completion}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full"
                        style={{ width: `${course.completion}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <p className="text-xs text-neutral-600 font-medium mb-4">
              Last updated {course.lastUpdated}
            </p>

            <div className="flex items-center gap-2">
              <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                <MagneticButton className="w-full glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60 text-sm py-2">
                  <Eye className="mr-2" size={16} />
                  VIEW
                </MagneticButton>
              </Link>
              <Link href={`/instructor/courses/${course.id}/edit`} className="flex-1">
                <MagneticButton className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black text-sm py-2">
                  <Edit className="mr-2" size={16} />
                  EDIT
                </MagneticButton>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card className="p-12 border-4 border-neutral-200 text-center">
          <BookOpen className="mx-auto text-neutral-400 mb-4" size={48} />
          <p className="text-lg font-bold text-neutral-600">No courses found</p>
          <p className="text-neutral-500 font-medium mt-2">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first course to get started'}
          </p>
        </Card>
      )}
    </div>
  )
}

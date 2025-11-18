'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConstructionLoader } from '@/components/ui/construction-loader'
import { useToast } from '@/hooks/use-toast'
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
  id: string
  title: string
  description?: string
  category: string
  difficulty?: string
  duration: number
  price: number
  thumbnail?: string
  published: boolean
  publishedAt?: string | null
  tags?: string[]
  instructor?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  _count?: {
    enrollments: number
    lessons: number
  }
  createdAt?: string
  updatedAt?: string
}

const STATUSES = ['All', 'Published', 'Draft']
const CATEGORIES = ['All', 'Safety', 'Equipment', 'Compliance', 'Technical']
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced']

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Safety',
    difficulty: 'Beginner',
    duration: 0,
    price: 0,
    thumbnail: '',
    tags: [] as string[]
  })
  const [formLoading, setFormLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadCourses()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchQuery, selectedStatus, selectedCategory])

  useEffect(() => {
    const elements = document.querySelectorAll('.courses-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [loading])

  const loadCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/courses')
      const result = await response.json()

      if (result.success && result.data) {
        setCourses(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to load courses',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = [...courses]

    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term) ||
        `${course.instructor?.firstName} ${course.instructor?.lastName}`.toLowerCase().includes(term)
      )
    }

    if (selectedStatus !== 'All') {
      if (selectedStatus === 'Published') {
        filtered = filtered.filter(course => course.published)
      } else if (selectedStatus === 'Draft') {
        filtered = filtered.filter(course => !course.published)
      }
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    setFilteredCourses(filtered)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Safety',
      difficulty: 'Beginner',
      duration: 0,
      price: 0,
      thumbnail: '',
      tags: []
    })
  }

  const handleCreateCourse = () => {
    resetForm()
    setIsCreateModalOpen(true)
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      description: course.description || '',
      category: course.category,
      difficulty: course.difficulty || 'Beginner',
      duration: course.duration,
      price: course.price,
      thumbnail: course.thumbnail || '',
      tags: course.tags || []
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course)
    setIsDeleteModalOpen(true)
  }

  const handleTogglePublish = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !course.published,
          publishedAt: !course.published ? new Date().toISOString() : null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: `Course ${!course.published ? 'published' : 'unpublished'} successfully`
        })
        loadCourses()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update course',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course',
        variant: 'destructive'
      })
    }
  }

  const submitCreateCourse = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty.toLowerCase(),
          duration: formData.duration,
          price: formData.price,
          thumbnail: formData.thumbnail || null,
          tags: formData.tags,
          published: false
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Course created successfully'
        })
        setIsCreateModalOpen(false)
        resetForm()
        loadCourses()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to create course',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create course',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitEditCourse = async () => {
    if (!selectedCourse || !formData.title || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Title and description are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          difficulty: formData.difficulty.toLowerCase(),
          duration: formData.duration,
          price: formData.price,
          thumbnail: formData.thumbnail || null,
          tags: formData.tags
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Course updated successfully'
        })
        setIsEditModalOpen(false)
        setSelectedCourse(null)
        resetForm()
        loadCourses()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to update course',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitDeleteCourse = async () => {
    if (!selectedCourse) return

    try {
      setFormLoading(true)
      const response = await fetch(`/api/courses/${selectedCourse.id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Course deleted successfully'
        })
        setIsDeleteModalOpen(false)
        setSelectedCourse(null)
        loadCourses()
      } else {
        toast({
          title: 'Error',
          description: result.message || result.error || 'Failed to delete course',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete course',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const getStatusColor = (published: boolean) => {
    return published ? 'from-success to-green-600' : 'from-warning to-orange-600'
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConstructionLoader />
      </div>
    )
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

              <MagneticButton
                onClick={handleCreateCourse}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black"
              >
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
              {courses.filter(c => c.published).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">PUBLISHED</p>
          </CardContent>
        </Card>

        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0)}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL ENROLLMENTS</p>
          </CardContent>
        </Card>

        <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {courses.filter(c => !c.published).length}
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
                      <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(course.published)} text-white font-black text-xs uppercase`}>
                        {course.published ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                        {course.category}
                      </span>
                      {course.difficulty && (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary/20 text-secondary">
                          {course.difficulty.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black text-neutral-800 mb-2 group-hover:text-success transition-colors">
                      {course.title}
                    </h3>
                    {course.instructor && (
                      <p className="text-sm font-semibold text-neutral-600">
                        Instructor: {course.instructor.firstName} {course.instructor.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                {course.description && (
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {course.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y-2 border-neutral-200">
                  <div className="text-center">
                    <Users className="mx-auto mb-1 text-primary" size={20} />
                    <p className="font-black text-neutral-800">{course._count?.enrollments || 0}</p>
                    <p className="text-xs text-neutral-600">Students</p>
                  </div>
                  <div className="text-center">
                    <BookOpen className="mx-auto mb-1 text-success" size={20} />
                    <p className="font-black text-neutral-800">{course._count?.lessons || 0}</p>
                    <p className="text-xs text-neutral-600">Lessons</p>
                  </div>
                  <div className="text-center">
                    <Clock className="mx-auto mb-1 text-warning" size={20} />
                    <p className="font-black text-neutral-800">{formatDuration(course.duration)}</p>
                    <p className="text-xs text-neutral-600">Duration</p>
                  </div>
                </div>

                {/* Price & Tags */}
                <div className="flex items-center justify-between text-sm">
                  <div className="font-black text-success">
                    {course.price === 0 ? 'FREE' : `$${course.price}`}
                  </div>
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {course.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-neutral-200 rounded">
                          {tag}
                        </span>
                      ))}
                      {course.tags.length > 2 && (
                        <span className="text-xs px-2 py-1 bg-neutral-200 rounded">
                          +{course.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <MagneticButton
                    onClick={() => handleTogglePublish(course)}
                    className={`flex-1 glass-effect border-2 font-black ${
                      course.published
                        ? 'border-warning/30 text-neutral-700 hover:border-warning/60'
                        : 'border-success/30 text-neutral-700 hover:border-success/60'
                    }`}
                  >
                    {course.published ? (
                      <>
                        <XCircle className="mr-2" size={16} />
                        UNPUBLISH
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2" size={16} />
                        PUBLISH
                      </>
                    )}
                  </MagneticButton>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="w-12 h-12 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all"
                  >
                    <Edit size={16} className="text-primary" />
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course)}
                    className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                  >
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>

                {/* Footer */}
                {course.updatedAt && (
                  <div className="text-xs text-neutral-500 pt-2">
                    Updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCourses.length === 0 && (
          <div className="col-span-2 text-center py-12">
            <p className="text-neutral-400 font-bold text-lg">No courses found</p>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="glass-effect border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Create New Course</DialogTitle>
            <DialogDescription>Add a new course to the platform</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter course description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
                >
                  <option value="Safety">Safety</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Price ($)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Thumbnail URL</label>
              <Input
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="safety, construction, basics"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitCreateCourse} disabled={formLoading} className="bg-success hover:bg-success/80">
              {formLoading ? 'Creating...' : 'Create Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-effect border-primary/30 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter course title"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter course description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
                >
                  <option value="Safety">Safety</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="120"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Price ($)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Thumbnail URL</label>
              <Input
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tags (comma-separated)</label>
              <Input
                value={formData.tags.join(', ')}
                onChange={(e) => setFormData({
                  ...formData,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="safety, construction, basics"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitEditCourse} disabled={formLoading} className="bg-primary hover:bg-primary/80">
              {formLoading ? 'Updating...' : 'Update Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass-effect border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-danger">Delete Course</DialogTitle>
            <DialogDescription>Are you sure you want to delete this course?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">
              Course: <span className="font-bold">{selectedCourse?.title}</span>
            </p>
            {selectedCourse?._count && selectedCourse._count.enrollments > 0 && (
              <p className="text-sm text-warning font-semibold mb-2">
                Warning: This course has {selectedCourse._count.enrollments} active enrollment(s).
              </p>
            )}
            <p className="text-sm text-danger font-semibold mt-4">
              This will also delete all associated lessons and cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={submitDeleteCourse}
              disabled={formLoading}
              variant="destructive"
            >
              {formLoading ? 'Deleting...' : 'Delete Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

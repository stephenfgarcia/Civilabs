'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { apiClient } from '@/lib/services'
import { useToast, useDebounce } from '@/lib/hooks'

interface Assignment {
  id: string
  title: string
  description: string | null
  courseId: string
  courseName: string
  status: string
  dueDate: string | null
  maxPoints: number
  totalSubmissions: number
  pendingSubmissions: number
  createdAt: string
  publishedAt: string | null
}

interface Stats {
  total: number
  published: number
  overdue: number
  pendingGrading: number
}

export default function InstructorAssignmentsPage() {
  useAuth(['INSTRUCTOR'])
  const { toast } = useToast()
  const router = useRouter()

  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    published: 0,
    overdue: 0,
    pendingGrading: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300) // Debounce search input to avoid excessive API calls
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([])

  // Form state for creating assignment
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100,
    allowLateSubmission: false,
  })

  useEffect(() => {
    fetchAssignments()
    fetchInstructorCourses()
  }, [statusFilter, debouncedSearchTerm]) // Use debounced search term to reduce API calls

  const fetchInstructorCourses = async () => {
    try {
      const response = await apiClient.get('/instructor/courses')
      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setCourses(apiData.data?.courses || apiData.courses || [])
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    }
  }

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm)

      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await apiClient.get(`/instructor/assignments${query}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setAssignments(apiData.data?.assignments || [])
        setStats(
          apiData.data?.stats || {
            total: 0,
            published: 0,
            overdue: 0,
            pendingGrading: 0,
          }
        )
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await apiClient.post('/instructor/assignments', formData)

      if (response.status >= 200 && response.status < 300) {
        setShowCreateModal(false)
        setFormData({
          title: '',
          description: '',
          instructions: '',
          courseId: '',
          dueDate: '',
          maxPoints: 100,
          allowLateSubmission: false,
        })
        fetchAssignments()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create assignment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to create assignment',
        variant: 'destructive',
      })
    }
  }

  const handlePublish = async (id: string) => {
    if (!confirm('Are you sure you want to publish this assignment?')) return

    try {
      const response = await apiClient.patch(`/instructor/assignments/${id}`, {
        action: 'publish',
      })

      if (response.status >= 200 && response.status < 300) {
        fetchAssignments()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to publish assignment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error publishing assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to publish assignment',
        variant: 'destructive',
      })
    }
  }

  const handleClose = async (id: string) => {
    if (!confirm('Are you sure you want to close this assignment?')) return

    try {
      const response = await apiClient.patch(`/instructor/assignments/${id}`, {
        action: 'close',
      })

      if (response.status >= 200 && response.status < 300) {
        fetchAssignments()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to close assignment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error closing assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to close assignment',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this assignment? This will also delete all submissions.'
      )
    )
      return

    try {
      const response = await apiClient.delete(`/instructor/assignments/${id}`)

      if (response.status >= 200 && response.status < 300) {
        setAssignments(assignments.filter((a) => a.id !== id))
        setStats((prev) => ({ ...prev, total: prev.total - 1 }))
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete assignment',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete assignment',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'CLOSED':
        return 'bg-red-100 text-red-800'
      case 'ARCHIVED':
        return 'bg-neutral-100 text-neutral-600'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Assignments</h1>
          <p className="text-neutral-600 mt-1">
            Manage assignments and grade submissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          + Create Assignment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Assignments</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Published</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.published}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Overdue</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.overdue}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Pending Grading</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.pendingGrading}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">
            Loading assignments...
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            No assignments found. Create your first assignment to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Assignment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Submissions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {assignment.title}
                        </div>
                        {assignment.description && (
                          <div className="text-sm text-neutral-500 line-clamp-1">
                            {assignment.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {assignment.courseName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {formatDate(assignment.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {assignment.totalSubmissions} total
                      </div>
                      {assignment.pendingSubmissions > 0 && (
                        <div className="text-sm text-yellow-600">
                          {assignment.pendingSubmissions} pending
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {assignment.status === 'DRAFT' && (
                          <button
                            onClick={() => handlePublish(assignment.id)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Publish
                          </button>
                        )}
                        {assignment.status === 'PUBLISHED' && (
                          <button
                            onClick={() => handleClose(assignment.id)}
                            className="text-orange-600 hover:text-orange-900 text-sm"
                          >
                            Close
                          </button>
                        )}
                        <button
                          onClick={() => router.push(`/instructor/assignments/${assignment.id}`)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900">
                  Create New Assignment
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Course *
                  </label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) =>
                      setFormData({ ...formData, courseId: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Instructions *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData({ ...formData, instructions: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) =>
                        setFormData({ ...formData, dueDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxPoints}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxPoints: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowLateSubmission"
                    checked={formData.allowLateSubmission}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        allowLateSubmission: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                  />
                  <label
                    htmlFor="allowLateSubmission"
                    className="ml-2 block text-sm text-neutral-900"
                  >
                    Allow late submissions
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Assignment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  Pin,
  Lock,
  Flag,
  CheckCircle,
  Search,
  Filter,
  Trash2,
  AlertCircle,
  Loader2,
  MessageCircle,
} from 'lucide-react'
import { apiClient } from '@/lib/services/api-client'
import Link from 'next/link'

interface Discussion {
  id: string
  title: string
  content: string
  courseId: string
  courseName: string
  user: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  isPinned: boolean
  isLocked: boolean
  isFlagged: boolean
  isSolved: boolean
  repliesCount: number
  createdAt: string
  updatedAt: string
}

interface Stats {
  total: number
  flagged: number
  solved: number
  unsolved: number
}

export default function InstructorDiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, flagged: 0, solved: 0, unsolved: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchDiscussions()

    // Animations
    const elements = document.querySelectorAll('.instructor-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [statusFilter])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await apiClient.get(`/instructor/discussions${query}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setDiscussions(apiData.data?.discussions || [])
        setStats(apiData.data?.stats || { total: 0, flagged: 0, solved: 0, unsolved: 0 })
      } else {
        throw new Error(response.error || 'Failed to fetch discussions')
      }
    } catch (err) {
      console.error('Error fetching discussions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load discussions')
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (id: string, action: string, value: boolean) => {
    try {
      const response = await apiClient.patch(`/instructor/discussions/${id}`, { action, value })

      if (response.status >= 200 && response.status < 300) {
        // Update local state
        setDiscussions(
          discussions.map((d) =>
            d.id === id
              ? {
                  ...d,
                  isPinned: action === 'pin' ? value : d.isPinned,
                  isLocked: action === 'lock' ? value : d.isLocked,
                  isSolved: action === 'solve' ? value : d.isSolved,
                  isFlagged: action === 'flag' ? value : d.isFlagged,
                }
              : d
          )
        )
      }
    } catch (err) {
      console.error(`Error ${action}ing discussion:`, err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return
    }

    try {
      const response = await apiClient.delete(`/instructor/discussions/${id}`)

      if (response.status >= 200 && response.status < 300) {
        setDiscussions(discussions.filter((d) => d.id !== id))
      }
    } catch (err) {
      console.error('Error deleting discussion:', err)
    }
  }

  const handleSearch = () => {
    fetchDiscussions()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading discussions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              ERROR LOADING DISCUSSIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error}</p>
            <MagneticButton
              onClick={fetchDiscussions}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
            >
              Try Again
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="instructor-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-indigo-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-indigo-500 bg-clip-text text-transparent mb-2">
              COURSE DISCUSSIONS
            </h1>
            <p className="text-lg font-bold text-neutral-700">
              Moderate and manage student discussions
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {stats.total}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL DISCUSSIONS</p>
          </CardContent>
        </Card>

        <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {stats.flagged}
            </div>
            <p className="text-sm font-bold text-neutral-600">FLAGGED</p>
          </CardContent>
        </Card>

        <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {stats.solved}
            </div>
            <p className="text-sm font-bold text-neutral-600">SOLVED</p>
          </CardContent>
        </Card>

        <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {stats.unsolved}
            </div>
            <p className="text-sm font-bold text-neutral-600">UNSOLVED</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <Filter size={20} />
            FILTERS & SEARCH
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">SEARCH</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search discussions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
                />
                <MagneticButton
                  onClick={handleSearch}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                >
                  <Search size={20} />
                </MagneticButton>
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">STATUS</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-12 glass-effect border-2 border-primary/30 focus:border-primary rounded-lg px-4 font-medium"
              >
                <option value="all">All Discussions</option>
                <option value="flagged">Flagged</option>
                <option value="solved">Solved</option>
                <option value="unsolved">Unsolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      <Card className="instructor-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <MessageSquare size={20} />
            DISCUSSIONS ({discussions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discussions.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto text-neutral-400 mb-4" size={64} />
              <p className="text-lg font-bold text-neutral-600">No discussions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <div
                  key={discussion.id}
                  className="glass-effect border-2 border-neutral-200 rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {discussion.isPinned && (
                          <Pin size={16} className="text-primary" fill="currentColor" />
                        )}
                        {discussion.isLocked && <Lock size={16} className="text-warning" />}
                        {discussion.isFlagged && <Flag size={16} className="text-danger" />}
                        {discussion.isSolved && <CheckCircle size={16} className="text-success" />}
                        <Link
                          href={`/instructor/discussions/${discussion.id}`}
                          className="text-xl font-black text-neutral-800 hover:text-primary transition-colors"
                        >
                          {discussion.title}
                        </Link>
                      </div>
                      <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
                        {discussion.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span className="font-semibold">{discussion.user.name}</span>
                        <span>•</span>
                        <span className="font-semibold text-primary">{discussion.courseName}</span>
                        <span>•</span>
                        <span>{discussion.repliesCount} replies</span>
                        <span>•</span>
                        <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <MagneticButton
                      onClick={() => handleAction(discussion.id, 'pin', !discussion.isPinned)}
                      className={`${
                        discussion.isPinned
                          ? 'bg-primary text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      } font-bold text-sm`}
                    >
                      <Pin size={14} className="mr-1" />
                      {discussion.isPinned ? 'Unpin' : 'Pin'}
                    </MagneticButton>

                    <MagneticButton
                      onClick={() => handleAction(discussion.id, 'lock', !discussion.isLocked)}
                      className={`${
                        discussion.isLocked
                          ? 'bg-warning text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      } font-bold text-sm`}
                    >
                      <Lock size={14} className="mr-1" />
                      {discussion.isLocked ? 'Unlock' : 'Lock'}
                    </MagneticButton>

                    <MagneticButton
                      onClick={() => handleAction(discussion.id, 'solve', !discussion.isSolved)}
                      className={`${
                        discussion.isSolved
                          ? 'bg-success text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      } font-bold text-sm`}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      {discussion.isSolved ? 'Unsolved' : 'Solve'}
                    </MagneticButton>

                    <MagneticButton
                      onClick={() => handleAction(discussion.id, 'flag', !discussion.isFlagged)}
                      className={`${
                        discussion.isFlagged
                          ? 'bg-danger text-white'
                          : 'bg-neutral-200 text-neutral-700'
                      } font-bold text-sm`}
                    >
                      <Flag size={14} className="mr-1" />
                      {discussion.isFlagged ? 'Unflag' : 'Flag'}
                    </MagneticButton>

                    <MagneticButton
                      onClick={() => handleDelete(discussion.id)}
                      className="bg-danger text-white font-bold text-sm"
                    >
                      <Trash2 size={14} className="mr-1" />
                      Delete
                    </MagneticButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

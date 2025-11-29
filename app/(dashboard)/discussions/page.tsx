'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  ThumbsUp,
  MessageCircle,
  Clock,
  User,
  TrendingUp,
  CheckCircle,
  Pin,
  Lock,
  Flag
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/services'

interface Discussion {
  id: string
  title: string
  content: string
  courseId: string | null
  userId: string
  status: string
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  isFlagged: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    role: string
  }
  course: {
    id: string
    title: string
  } | null
  _count: {
    replies: number
    likes: number
  }
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'unanswered', label: 'Unanswered' }
]

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch discussions from API
  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get('/discussions')

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setDiscussions(apiData.data || [])
      } else {
        setError(response.error || 'Failed to fetch discussions')
      }
    } catch (err) {
      console.error('Error fetching discussions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch discussions')
    } finally {
      setLoading(false)
    }
  }

  // Entrance animations
  useEffect(() => {
    if (!loading) {
      const elements = document.querySelectorAll('.discussion-item')
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
      })
    }
  }, [sortBy, loading])

  const filteredDiscussions = discussions
    .filter(d => {
      const matchesSearch = !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.content.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'solved' && d.isSolved) ||
        (statusFilter === 'unsolved' && !d.isSolved && d.status === 'OPEN') ||
        (statusFilter === 'locked' && d.isLocked)

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b._count.likes - a._count.likes
      if (sortBy === 'unanswered') return a._count.replies - b._count.replies
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Separate pinned and regular discussions
  const pinnedDiscussions = filteredDiscussions.filter(d => d.isPinned)
  const regularDiscussions = filteredDiscussions.filter(d => !d.isPinned)

  const totalDiscussions = discussions.length
  const totalReplies = discussions.reduce((acc, d) => acc + d._count.replies, 0)
  const solvedCount = discussions.filter(d => d.isSolved).length

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-bold text-neutral-600">Loading discussions...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <Card className="glass-effect concrete-texture border-4 border-danger/40">
        <CardContent className="py-16 text-center">
          <div className="w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="text-danger" size={48} />
          </div>
          <h3 className="text-2xl font-black text-neutral-700 mb-2">ERROR LOADING DISCUSSIONS</h3>
          <p className="text-neutral-600 font-semibold mb-6">{error}</p>
          <MagneticButton
            onClick={() => fetchDiscussions()}
            className="bg-gradient-to-r from-danger to-red-600 text-white font-black"
          >
            RETRY
          </MagneticButton>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="discussion-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-secondary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-secondary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-secondary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-secondary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-secondary/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-purple-500 to-pink-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-secondary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    DISCUSSIONS
                  </h1>
                  <p className="text-sm font-bold text-neutral-600 mt-1">
                    CONNECT WITH THE COMMUNITY
                  </p>
                </div>
              </div>

              <Link href="/discussions/new">
                <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                  <Plus className="mr-2" size={20} />
                  NEW DISCUSSION
                </MagneticButton>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-effect border-2 border-secondary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
                    {totalDiscussions}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">TOTAL DISCUSSIONS</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-primary/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
                    {totalReplies}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">TOTAL REPLIES</p>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-success/30">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
                    {solvedCount}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">SOLVED</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="discussion-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          {/* Status Filters */}
          <div>
            <p className="text-sm font-bold text-neutral-700 mb-3">STATUS</p>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: 'all', label: 'All' },
                { value: 'solved', label: 'Solved' },
                { value: 'unsolved', label: 'Unsolved' },
                { value: 'locked', label: 'Locked' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    statusFilter === status.value
                      ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <p className="text-sm font-bold text-neutral-700 mb-3">SORT BY</p>
            <div className="flex gap-3 flex-wrap">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    sortBy === option.value
                      ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pinned Discussions */}
      {pinnedDiscussions.length > 0 && (
        <div className="space-y-4">
          <div className="discussion-item opacity-0">
            <div className="flex items-center gap-2">
              <Pin className="text-warning" size={20} />
              <h2 className="text-xl font-black text-neutral-800">PINNED DISCUSSIONS</h2>
            </div>
          </div>

          {pinnedDiscussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
          ))}
        </div>
      )}

      {/* Regular Discussions */}
      <div className="space-y-4">
        {pinnedDiscussions.length > 0 && (
          <div className="discussion-item opacity-0">
            <h2 className="text-xl font-black text-neutral-800">ALL DISCUSSIONS</h2>
          </div>
        )}

        {regularDiscussions.length > 0 ? (
          regularDiscussions.map((discussion) => (
            <DiscussionCard key={discussion.id} discussion={discussion} formatDate={formatDate} />
          ))
        ) : (
          <Card className="discussion-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-neutral-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-neutral-700 mb-2">NO DISCUSSIONS FOUND</h3>
              <p className="text-neutral-600 font-semibold mb-6">
                {searchQuery ? `No discussions match "${searchQuery}"` : 'No discussions available'}
              </p>
              <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                <Plus className="mr-2" size={20} />
                START A DISCUSSION
              </MagneticButton>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function DiscussionCard({ discussion, formatDate }: { discussion: Discussion; formatDate: (date: string) => string }) {
  return (
    <Link href={`/discussions/${discussion.id}`}>
      <Card className="discussion-item opacity-0 glass-effect concrete-texture border-4 border-secondary/20 hover:border-secondary/40 transition-all group cursor-pointer">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {discussion.isPinned && (
                    <Pin className="text-warning flex-shrink-0" size={16} />
                  )}
                  {discussion.isLocked && (
                    <Lock className="text-neutral-500 flex-shrink-0" size={16} />
                  )}
                  {discussion.isFlagged && (
                    <Flag className="text-danger flex-shrink-0" size={16} />
                  )}
                  {discussion.isSolved && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle size={16} />
                      <span className="text-xs font-black">SOLVED</span>
                    </div>
                  )}
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-purple-600 text-white">
                    {discussion.status}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-neutral-800 mb-2 group-hover:text-secondary transition-colors">
                  {discussion.title}
                </h3>

                <p className="text-neutral-600 mb-3 line-clamp-2">
                  {discussion.content.substring(0, 200)}...
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{discussion.user.firstName} {discussion.user.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDate(discussion.createdAt)}</span>
                  </div>
                  {discussion.course && (
                    <div className="text-xs text-neutral-500">
                      in {discussion.course.title}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t-2 border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-white" size={14} />
                </div>
                <span className="font-black text-neutral-800">{discussion._count.replies}</span>
                <span className="text-sm text-neutral-600">replies</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="text-white" size={14} />
                </div>
                <span className="font-black text-neutral-800">{discussion._count.likes}</span>
                <span className="text-sm text-neutral-600">likes</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="text-success" size={16} />
                <span className="font-black text-neutral-800">{discussion.viewCount}</span>
                <span className="text-sm text-neutral-600">views</span>
              </div>

              <div className="ml-auto text-xs font-bold text-neutral-500">
                Last activity: {formatDate(discussion.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

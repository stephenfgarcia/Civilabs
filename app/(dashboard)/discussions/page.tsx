'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/page-states'
import { useEntranceAnimation } from '@/lib/hooks'
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
  Flag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/services'
import { sanitizeSearchQuery } from '@/lib/utils/sanitize'

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

const ITEMS_PER_PAGE = 10

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

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
        const apiData = response.data as { data: Discussion[] }
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

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.discussion-item', staggerDelay: 0.05 }, [sortBy, loading])

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
  const allRegularDiscussions = filteredDiscussions.filter(d => !d.isPinned)

  // Pagination for regular discussions
  const totalPages = Math.ceil(allRegularDiscussions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const regularDiscussions = allRegularDiscussions.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, sortBy])

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
    return <LoadingState message="Loading discussions..." size="lg" />
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        title="Error Loading Discussions"
        message={error}
        onRetry={fetchDiscussions}
      />
    )
  }

  return (
    <div className="space-y-6" role="main" aria-label="Discussions">
      {/* Header */}
      <header className="discussion-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-secondary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-secondary/60" aria-hidden="true"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-secondary/60" aria-hidden="true"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-secondary/60" aria-hidden="true"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-secondary/60" aria-hidden="true"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-purple-500 to-pink-500 opacity-10" aria-hidden="true"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20" aria-hidden="true"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center" aria-hidden="true">
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

              <Link href="/discussions/new" aria-label="Create new discussion">
                <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                  <Plus className="mr-2" size={20} aria-hidden="true" />
                  NEW DISCUSSION
                </MagneticButton>
              </Link>
            </div>

            {/* Stats */}
            <dl className="grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Discussion statistics">
              <Card className="glass-effect border-2 border-secondary/30">
                <CardContent className="p-6 text-center">
                  <dt className="text-sm font-bold text-neutral-600 order-2">TOTAL DISCUSSIONS</dt>
                  <dd className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2 order-1">
                    {totalDiscussions}
                  </dd>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-primary/30">
                <CardContent className="p-6 text-center">
                  <dt className="text-sm font-bold text-neutral-600 order-2">TOTAL REPLIES</dt>
                  <dd className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2 order-1">
                    {totalReplies}
                  </dd>
                </CardContent>
              </Card>

              <Card className="glass-effect border-2 border-success/30">
                <CardContent className="p-6 text-center">
                  <dt className="text-sm font-bold text-neutral-600 order-2">SOLVED</dt>
                  <dd className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2 order-1">
                    {solvedCount}
                  </dd>
                </CardContent>
              </Card>
            </dl>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <Card className="discussion-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative" role="search">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} aria-hidden="true" />
            <label htmlFor="discussion-search" className="sr-only">Search discussions</label>
            <Input
              id="discussion-search"
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
              maxLength={200}
            />
          </div>

          {/* Status Filters */}
          <fieldset>
            <legend className="text-sm font-bold text-neutral-700 mb-3">STATUS</legend>
            <div className="flex gap-3 flex-wrap" role="radiogroup" aria-label="Filter by status">
              {[
                { value: 'all', label: 'All' },
                { value: 'solved', label: 'Solved' },
                { value: 'unsolved', label: 'Unsolved' },
                { value: 'locked', label: 'Locked' },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  role="radio"
                  aria-checked={statusFilter === status.value}
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
          </fieldset>

          {/* Sort Options */}
          <fieldset>
            <legend className="text-sm font-bold text-neutral-700 mb-3">SORT BY</legend>
            <div className="flex gap-3 flex-wrap" role="radiogroup" aria-label="Sort discussions by">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  role="radio"
                  aria-checked={sortBy === option.value}
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
          </fieldset>
        </CardContent>
      </Card>

      {/* Pinned Discussions */}
      {pinnedDiscussions.length > 0 && (
        <section className="space-y-4" aria-labelledby="pinned-heading">
          <div className="discussion-item opacity-0">
            <div className="flex items-center gap-2">
              <Pin className="text-warning" size={20} aria-hidden="true" />
              <h2 id="pinned-heading" className="text-xl font-black text-neutral-800">PINNED DISCUSSIONS</h2>
            </div>
          </div>

          <ul role="list" aria-label="Pinned discussions">
            {pinnedDiscussions.map((discussion) => (
              <li key={discussion.id}>
                <DiscussionCard discussion={discussion} formatDate={formatDate} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Regular Discussions */}
      <section className="space-y-4" aria-labelledby="all-discussions-heading">
        {pinnedDiscussions.length > 0 && (
          <div className="discussion-item opacity-0">
            <h2 id="all-discussions-heading" className="text-xl font-black text-neutral-800">ALL DISCUSSIONS</h2>
          </div>
        )}

        {regularDiscussions.length > 0 ? (
          <ul role="list" aria-label={`${allRegularDiscussions.length} discussions`}>
            {regularDiscussions.map((discussion) => (
              <li key={discussion.id}>
                <DiscussionCard discussion={discussion} formatDate={formatDate} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={<MessageSquare size={48} />}
            title="No Discussions Found"
            description={searchQuery ? `No discussions match "${searchQuery}"` : 'No discussions available'}
            action={
              <Link href="/discussions/new" aria-label="Start a new discussion">
                <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                  <Plus className="mr-2" size={20} aria-hidden="true" />
                  START A DISCUSSION
                </MagneticButton>
              </Link>
            }
          />
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="discussion-item opacity-0" aria-label="Pagination">
            <Card className="glass-effect concrete-texture border-4 border-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Page Info */}
                  <p className="text-sm font-bold text-neutral-600" aria-live="polite">
                    Showing {startIndex + 1}-{Math.min(endIndex, allRegularDiscussions.length)} of {allRegularDiscussions.length} discussions
                  </p>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2" role="group" aria-label="Page navigation">
                    {/* First Page */}
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg glass-effect border-2 border-secondary/30 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary/60 transition-all"
                      aria-label="Go to first page"
                    >
                      <ChevronsLeft size={18} aria-hidden="true" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-lg glass-effect border-2 border-secondary/30 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary/60 transition-all"
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first, last, current, and adjacent pages
                          if (page === 1 || page === totalPages) return true
                          if (Math.abs(page - currentPage) <= 1) return true
                          return false
                        })
                        .map((page, index, arr) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore = index > 0 && page - arr[index - 1] > 1
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsisBefore && (
                                <span className="px-2 text-neutral-500 font-bold" aria-hidden="true">...</span>
                              )}
                              <button
                                onClick={() => setCurrentPage(page)}
                                aria-label={`Page ${page}`}
                                aria-current={currentPage === page ? 'page' : undefined}
                                className={`w-10 h-10 rounded-lg font-black transition-all ${
                                  currentPage === page
                                    ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                                    : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                                }`}
                              >
                                {page}
                              </button>
                            </div>
                          )
                        })}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg glass-effect border-2 border-secondary/30 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary/60 transition-all"
                      aria-label="Go to next page"
                    >
                      <ChevronRight size={18} aria-hidden="true" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="w-10 h-10 rounded-lg glass-effect border-2 border-secondary/30 flex items-center justify-center font-bold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-secondary/60 transition-all"
                      aria-label="Go to last page"
                    >
                      <ChevronsRight size={18} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </nav>
        )}
      </section>
    </div>
  )
}

function DiscussionCard({ discussion, formatDate }: { discussion: Discussion; formatDate: (date: string) => string }) {
  return (
    <Link href={`/discussions/${discussion.id}`} aria-label={`View discussion: ${discussion.title}`}>
      <article className="discussion-item opacity-0 mb-4">
        <Card className="glass-effect concrete-texture border-4 border-secondary/20 hover:border-secondary/40 transition-all group cursor-pointer">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap" aria-label="Discussion status">
                    {discussion.isPinned && (
                      <span className="flex items-center" aria-label="Pinned">
                        <Pin className="text-warning flex-shrink-0" size={16} aria-hidden="true" />
                      </span>
                    )}
                    {discussion.isLocked && (
                      <span className="flex items-center" aria-label="Locked">
                        <Lock className="text-neutral-500 flex-shrink-0" size={16} aria-hidden="true" />
                      </span>
                    )}
                    {discussion.isFlagged && (
                      <span className="flex items-center" aria-label="Flagged">
                        <Flag className="text-danger flex-shrink-0" size={16} aria-hidden="true" />
                      </span>
                    )}
                    {discussion.isSolved && (
                      <span className="flex items-center gap-1 text-success" aria-label="Solved">
                        <CheckCircle size={16} aria-hidden="true" />
                        <span className="text-xs font-black">SOLVED</span>
                      </span>
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
                      <User size={14} aria-hidden="true" />
                      <span>{discussion.user.firstName} {discussion.user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} aria-hidden="true" />
                      <time dateTime={discussion.createdAt}>{formatDate(discussion.createdAt)}</time>
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
              <dl className="flex items-center gap-6 pt-4 border-t-2 border-neutral-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <MessageCircle className="text-white" size={14} />
                  </div>
                  <dt className="sr-only">Replies</dt>
                  <dd>
                    <span className="font-black text-neutral-800">{discussion._count.replies}</span>
                    <span className="text-sm text-neutral-600 ml-1">replies</span>
                  </dd>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                    <ThumbsUp className="text-white" size={14} />
                  </div>
                  <dt className="sr-only">Likes</dt>
                  <dd>
                    <span className="font-black text-neutral-800">{discussion._count.likes}</span>
                    <span className="text-sm text-neutral-600 ml-1">likes</span>
                  </dd>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="text-success" size={16} aria-hidden="true" />
                  <dt className="sr-only">Views</dt>
                  <dd>
                    <span className="font-black text-neutral-800">{discussion.viewCount}</span>
                    <span className="text-sm text-neutral-600 ml-1">views</span>
                  </dd>
                </div>

                <div className="ml-auto text-xs font-bold text-neutral-500">
                  <dt className="sr-only">Last activity</dt>
                  <dd>Last activity: <time dateTime={discussion.updatedAt}>{formatDate(discussion.updatedAt)}</time></dd>
                </div>
              </dl>
            </div>
          </CardContent>
        </Card>
      </article>
    </Link>
  )
}

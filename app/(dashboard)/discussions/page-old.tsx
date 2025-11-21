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
  Tag,
  TrendingUp,
  CheckCircle,
  Pin,
  Lock
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Discussion {
  id: number
  title: string
  author: string
  authorAvatar?: string
  category: string
  course: string
  createdAt: string
  lastActivity: string
  views: number
  replies: number
  likes: number
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  tags: string[]
  preview: string
}

// Mock discussions data
const MOCK_DISCUSSIONS: Discussion[] = [
  {
    id: 1,
    title: 'Best practices for fall protection systems?',
    author: 'Mike Chen',
    category: 'Safety',
    course: 'Construction Safety Fundamentals',
    createdAt: '2 hours ago',
    lastActivity: '15 minutes ago',
    views: 245,
    replies: 18,
    likes: 34,
    isPinned: true,
    isLocked: false,
    isSolved: true,
    tags: ['Fall Protection', 'OSHA', 'Safety'],
    preview: 'Looking for recommendations on the most effective fall protection systems for high-rise construction projects...'
  },
  {
    id: 2,
    title: 'Quiz 2 - OSHA Regulations clarification needed',
    author: 'Sarah Johnson',
    category: 'Questions',
    course: 'Construction Safety Fundamentals',
    createdAt: '5 hours ago',
    lastActivity: '1 hour ago',
    views: 156,
    replies: 12,
    likes: 23,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    tags: ['Quiz Help', 'OSHA'],
    preview: 'Can someone explain the difference between 1926.500 and 1926.501 regulations? I got confused on question 5...'
  },
  {
    id: 3,
    title: 'Excavator operation tips for beginners',
    author: 'David Martinez',
    category: 'Tips & Tricks',
    course: 'Heavy Equipment Operation',
    createdAt: '1 day ago',
    lastActivity: '3 hours ago',
    views: 423,
    replies: 31,
    likes: 67,
    isPinned: true,
    isLocked: false,
    isSolved: false,
    tags: ['Excavator', 'Equipment', 'Beginner'],
    preview: 'After completing the course, here are some practical tips I learned from experienced operators...'
  },
  {
    id: 4,
    title: 'PPE requirements update - 2024 changes',
    author: 'Admin',
    category: 'Announcements',
    course: 'Construction Safety Fundamentals',
    createdAt: '2 days ago',
    lastActivity: '2 days ago',
    views: 892,
    replies: 5,
    likes: 45,
    isPinned: true,
    isLocked: true,
    isSolved: false,
    tags: ['PPE', 'Announcement', 'Updates'],
    preview: 'Important updates to PPE requirements effective March 2024. Please review the new guidelines...'
  },
  {
    id: 5,
    title: 'Study group for upcoming certification exam',
    author: 'Jennifer Lee',
    category: 'Study Groups',
    course: 'Construction Safety Fundamentals',
    createdAt: '3 days ago',
    lastActivity: '5 hours ago',
    views: 167,
    replies: 24,
    likes: 19,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    tags: ['Study Group', 'Certification'],
    preview: 'Looking to form a study group for the safety certification exam scheduled for next month...'
  },
  {
    id: 6,
    title: 'Scaffold inspection checklist - share your templates',
    author: 'Robert Kim',
    category: 'Resources',
    course: 'Construction Safety Fundamentals',
    createdAt: '4 days ago',
    lastActivity: '1 day ago',
    views: 334,
    replies: 15,
    likes: 41,
    isPinned: false,
    isLocked: false,
    isSolved: true,
    tags: ['Scaffold', 'Checklist', 'Resources'],
    preview: 'Does anyone have a good scaffold inspection checklist template they can share?...'
  },
  {
    id: 7,
    title: 'Crane safety - wind speed limitations',
    author: 'Tom Wilson',
    category: 'Safety',
    course: 'Heavy Equipment Operation',
    createdAt: '5 days ago',
    lastActivity: '2 days ago',
    views: 298,
    replies: 9,
    likes: 28,
    isPinned: false,
    isLocked: false,
    isSolved: true,
    tags: ['Crane', 'Weather', 'Safety'],
    preview: 'What are the standard wind speed limitations for crane operations? The course mentions 30mph but...'
  },
  {
    id: 8,
    title: 'Recommended additional reading materials',
    author: 'Emily Zhang',
    category: 'Resources',
    course: 'Construction Safety Fundamentals',
    createdAt: '1 week ago',
    lastActivity: '3 days ago',
    views: 445,
    replies: 22,
    likes: 56,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    tags: ['Reading', 'Resources'],
    preview: 'Here are some excellent books and resources I found helpful for supplemental learning...'
  }
]

const CATEGORIES = ['All', 'Safety', 'Questions', 'Tips & Tricks', 'Announcements', 'Study Groups', 'Resources']

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'unanswered', label: 'Unanswered' }
]

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [apiMessage, setApiMessage] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch discussions from API
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true)
        setError(null)

        const token = localStorage.getItem('token')
        const response = await fetch('/api/discussions', {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` })
          }
        })

        const data = await response.json()

        if (data.success) {
          setDiscussions(data.data || [])
          // Store API message if discussions are empty (e.g., "coming soon" message)
          if (data.message && data.data.length === 0) {
            setApiMessage(data.message)
          }
        } else {
          setError(data.message || 'Failed to fetch discussions')
        }
      } catch (err) {
        console.error('Error fetching discussions:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch discussions')
      } finally {
        setLoading(false)
      }
    }

    fetchDiscussions()
  }, [])

  // Entrance animations
  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.discussion-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [selectedCategory, sortBy, loading])

  const filteredDiscussions = discussions
    .filter(d => {
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory
      const matchesSearch = !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'popular') return b.likes - a.likes
      if (sortBy === 'unanswered') return a.replies - b.replies
      return 0 // recent is default order
    })

  // Separate pinned and regular discussions
  const pinnedDiscussions = filteredDiscussions.filter(d => d.isPinned)
  const regularDiscussions = filteredDiscussions.filter(d => !d.isPinned)

  const totalDiscussions = discussions.length
  const totalReplies = discussions.reduce((acc, d) => acc + d.replies, 0)
  const activeToday = discussions.filter(d => d.lastActivity.includes('hour') || d.lastActivity.includes('minute')).length

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
            onClick={() => window.location.reload()}
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

              <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                <Plus className="mr-2" size={20} />
                NEW DISCUSSION
              </MagneticButton>
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
                    {activeToday}
                  </div>
                  <p className="text-sm font-bold text-neutral-600">ACTIVE TODAY</p>
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
              placeholder="Search discussions, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          {/* Category Filters */}
          <div>
            <p className="text-sm font-bold text-neutral-700 mb-3">CATEGORIES</p>
            <div className="flex gap-3 flex-wrap">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                  }`}
                >
                  {category}
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
            <DiscussionCard key={discussion.id} discussion={discussion} />
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
            <DiscussionCard key={discussion.id} discussion={discussion} />
          ))
        ) : (
          <Card className="discussion-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-neutral-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-neutral-700 mb-2">NO DISCUSSIONS FOUND</h3>
              <p className="text-neutral-600 font-semibold mb-6">
                {apiMessage ? (
                  apiMessage
                ) : searchQuery ? (
                  `No discussions match "${searchQuery}"`
                ) : (
                  `No discussions in ${selectedCategory} category`
                )}
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

function DiscussionCard({ discussion }: { discussion: Discussion }) {
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
                  {discussion.isSolved && (
                    <div className="flex items-center gap-1 text-success">
                      <CheckCircle size={16} />
                      <span className="text-xs font-black">SOLVED</span>
                    </div>
                  )}
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-purple-600 text-white">
                    {discussion.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-neutral-800 mb-2 group-hover:text-secondary transition-colors">
                  {discussion.title}
                </h3>

                <p className="text-neutral-600 mb-3 line-clamp-2">
                  {discussion.preview}
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {discussion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs font-bold px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 flex items-center gap-1"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600 flex-wrap">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{discussion.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{discussion.createdAt}</span>
                  </div>
                  <div className="text-xs text-neutral-500">
                    in {discussion.course}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t-2 border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <MessageCircle className="text-white" size={14} />
                </div>
                <span className="font-black text-neutral-800">{discussion.replies}</span>
                <span className="text-sm text-neutral-600">replies</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center">
                  <ThumbsUp className="text-white" size={14} />
                </div>
                <span className="font-black text-neutral-800">{discussion.likes}</span>
                <span className="text-sm text-neutral-600">likes</span>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="text-success" size={16} />
                <span className="font-black text-neutral-800">{discussion.views}</span>
                <span className="text-sm text-neutral-600">views</span>
              </div>

              <div className="ml-auto text-xs font-bold text-neutral-500">
                Last activity: {discussion.lastActivity}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

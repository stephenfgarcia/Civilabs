'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  MessageSquare,
  Search,
  Filter,
  Pin,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Trash2,
  Eye,
  Flag,
  User,
  Clock,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

interface Discussion {
  id: string
  title: string
  author: string
  authorEmail: string
  category: string
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  isFlagged: boolean
  replies: number
  likes: number
  views: number
  createdDate: string
  lastActivity: string
  flagReason?: string
}

const CATEGORIES = ['All', 'Safety', 'Equipment', 'Questions', 'Tips & Tricks', 'Announcements', 'General']
const STATUSES = ['All', 'Active', 'Solved', 'Locked', 'Flagged']

export default function AdminDiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDiscussions()
  }, [])

  useEffect(() => {
    if (!loading) {
      const elements = document.querySelectorAll('.admin-discussions-item')
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
      })
    }
  }, [loading])

  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/discussions')
      const data = await response.json()
      if (data.success && data.data) {
        // Transform API data to match UI interface
        const transformed = data.data.map((d: any) => ({
          id: d.id,
          title: d.title,
          author: `${d.author?.firstName || ''} ${d.author?.lastName || ''}`.trim() || d.user?.firstName ? `${d.user.firstName} ${d.user.lastName}` : 'Unknown',
          authorEmail: d.author?.email || d.user?.email || '',
          category: d.category || 'General',
          isPinned: d.isPinned || false,
          isLocked: d.isLocked || false,
          isSolved: d.isSolved || false,
          isFlagged: d.isFlagged || false,
          replies: d._count?.replies || 0,
          likes: d._count?.likes || 0,
          views: d.viewCount || d.views || 0,
          createdDate: new Date(d.createdAt).toISOString().split('T')[0],
          lastActivity: formatRelativeTime(d.updatedAt),
        }))
        setDiscussions(transformed)
      }
    } catch (error) {
      console.error('Error fetching discussions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load discussions',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    return date.toLocaleDateString()
  }

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = !searchQuery ||
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || discussion.category === selectedCategory

    let matchesStatus = true
    if (selectedStatus === 'Solved') matchesStatus = discussion.isSolved
    else if (selectedStatus === 'Locked') matchesStatus = discussion.isLocked
    else if (selectedStatus === 'Flagged') matchesStatus = discussion.isFlagged
    else if (selectedStatus === 'Active') matchesStatus = !discussion.isLocked && !discussion.isSolved

    return matchesSearch && matchesCategory && matchesStatus
  })

  const moderateDiscussion = async (id: string, action: string) => {
    try {
      const response = await fetch(`/api/discussions/${id}/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      const data = await response.json()
      if (!data.success) {
        throw new Error(data.message || 'Failed to moderate discussion')
      }
      return data
    } catch (error) {
      throw error
    }
  }

  const togglePin = async (id: string) => {
    const discussion = discussions.find(d => d.id === id)
    if (!discussion) return

    try {
      const action = discussion.isPinned ? 'unpin' : 'pin'
      await moderateDiscussion(id, action)

      toast({
        title: 'Success',
        description: `Discussion ${discussion.isPinned ? 'unpinned' : 'pinned'} successfully`
      })

      // Update local state
      setDiscussions(discussions.map(d =>
        d.id === id ? { ...d, isPinned: !d.isPinned } : d
      ))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update discussion',
        variant: 'destructive'
      })
    }
  }

  const toggleLock = async (id: string) => {
    const discussion = discussions.find(d => d.id === id)
    if (!discussion) return

    try {
      const action = discussion.isLocked ? 'unlock' : 'lock'
      await moderateDiscussion(id, action)

      toast({
        title: 'Success',
        description: `Discussion ${discussion.isLocked ? 'unlocked' : 'locked'} successfully`
      })

      setDiscussions(discussions.map(d =>
        d.id === id ? { ...d, isLocked: !d.isLocked } : d
      ))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update discussion',
        variant: 'destructive'
      })
    }
  }

  const markSolved = async (id: string) => {
    const discussion = discussions.find(d => d.id === id)
    if (!discussion) return

    try {
      const action = discussion.isSolved ? 'unsolve' : 'solve'
      await moderateDiscussion(id, action)

      toast({
        title: 'Success',
        description: `Discussion ${discussion.isSolved ? 'unmarked' : 'marked'} as solved`
      })

      setDiscussions(discussions.map(d =>
        d.id === id ? { ...d, isSolved: !d.isSolved } : d
      ))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update discussion',
        variant: 'destructive'
      })
    }
  }

  const deleteDiscussion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/discussions/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || 'Failed to delete discussion')
      }

      toast({
        title: 'Success',
        description: 'Discussion deleted successfully'
      })

      setDiscussions(discussions.filter(d => d.id !== id))
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete discussion',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-discussions-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-purple-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-purple-600/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-purple-600/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-purple-600/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-purple-600/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-pink-600 bg-clip-text text-transparent mb-2">
                  DISCUSSION MODERATION
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Moderate discussions and manage community
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black">
                <MessageSquare className="mr-2" size={20} />
                CREATE ANNOUNCEMENT
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {discussions.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL</p>
          </CardContent>
        </Card>

        <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {discussions.filter(d => d.isSolved).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">SOLVED</p>
          </CardContent>
        </Card>

        <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {discussions.filter(d => d.isLocked).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">LOCKED</p>
          </CardContent>
        </Card>

        <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {discussions.filter(d => d.isFlagged).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">FLAGGED</p>
          </CardContent>
        </Card>

        <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {discussions.filter(d => d.isPinned).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">PINNED</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
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
              placeholder="Search discussions by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">CATEGORY</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-purple-500/30 text-neutral-700 hover:border-purple-500/60'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      <Card className="admin-discussions-item opacity-0 glass-effect concrete-texture border-4 border-purple-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            DISCUSSIONS ({filteredDiscussions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <div
                key={discussion.id}
                className={`glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 ${
                  discussion.isFlagged ? 'border-danger/40' : 'border-transparent hover:border-purple-500/30'
                }`}
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {discussion.isPinned && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-warning to-orange-600 text-white font-black text-xs flex items-center gap-1">
                            <Pin size={12} />
                            PINNED
                          </span>
                        )}
                        {discussion.isSolved && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-success to-green-600 text-white font-black text-xs flex items-center gap-1">
                            <CheckCircle size={12} />
                            SOLVED
                          </span>
                        )}
                        {discussion.isLocked && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-neutral-400 to-neutral-600 text-white font-black text-xs flex items-center gap-1">
                            <Lock size={12} />
                            LOCKED
                          </span>
                        )}
                        {discussion.isFlagged && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-danger to-red-600 text-white font-black text-xs flex items-center gap-1">
                            <Flag size={12} />
                            FLAGGED
                          </span>
                        )}
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                          {discussion.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-neutral-800 mb-2">
                        {discussion.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <User size={14} />
                        <span className="font-bold">{discussion.author}</span>
                        <span>•</span>
                        <span>{discussion.authorEmail}</span>
                      </div>
                      {discussion.flagReason && (
                        <div className="flex items-start gap-2 p-3 bg-danger/10 border-2 border-danger/30 rounded-lg mt-2">
                          <AlertTriangle className="text-danger flex-shrink-0 mt-0.5" size={16} />
                          <div>
                            <p className="font-bold text-danger text-sm">FLAG REASON:</p>
                            <p className="text-sm text-neutral-700">{discussion.flagReason}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 py-3 border-y-2 border-neutral-200">
                    <div className="text-center">
                      <MessageCircle className="mx-auto mb-1 text-primary" size={20} />
                      <p className="font-black text-neutral-800">{discussion.replies}</p>
                      <p className="text-xs text-neutral-600">Replies</p>
                    </div>
                    <div className="text-center">
                      <ThumbsUp className="mx-auto mb-1 text-success" size={20} />
                      <p className="font-black text-neutral-800">{discussion.likes}</p>
                      <p className="text-xs text-neutral-600">Likes</p>
                    </div>
                    <div className="text-center">
                      <Eye className="mx-auto mb-1 text-warning" size={20} />
                      <p className="font-black text-neutral-800">{discussion.views}</p>
                      <p className="text-xs text-neutral-600">Views</p>
                    </div>
                    <div className="text-center">
                      <Clock size={14} className="mx-auto mb-1 text-neutral-400" />
                      <p className="font-bold text-neutral-800 text-xs">{discussion.lastActivity}</p>
                      <p className="text-xs text-neutral-600">Last Activity</p>
                    </div>
                    <div className="text-center col-span-2">
                      <p className="font-bold text-neutral-800 text-xs">
                        Created: {new Date(discussion.createdDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <MagneticButton className="glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                      <Eye className="mr-2" size={16} />
                      VIEW
                    </MagneticButton>
                    <button
                      onClick={() => togglePin(discussion.id)}
                      className={`px-4 py-2 rounded-lg font-black transition-all ${
                        discussion.isPinned
                          ? 'bg-gradient-to-r from-warning to-orange-600 text-white'
                          : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                      }`}
                    >
                      <Pin className="inline mr-2" size={16} />
                      {discussion.isPinned ? 'UNPIN' : 'PIN'}
                    </button>
                    <button
                      onClick={() => toggleLock(discussion.id)}
                      className={`px-4 py-2 rounded-lg font-black transition-all ${
                        discussion.isLocked
                          ? 'bg-gradient-to-r from-neutral-400 to-neutral-600 text-white'
                          : 'glass-effect border-2 border-neutral-400/30 text-neutral-700 hover:border-neutral-400/60'
                      }`}
                    >
                      {discussion.isLocked ? (
                        <><Unlock className="inline mr-2" size={16} />UNLOCK</>
                      ) : (
                        <><Lock className="inline mr-2" size={16} />LOCK</>
                      )}
                    </button>
                    <button
                      onClick={() => markSolved(discussion.id)}
                      className={`px-4 py-2 rounded-lg font-black transition-all ${
                        discussion.isSolved
                          ? 'bg-gradient-to-r from-success to-green-600 text-white'
                          : 'glass-effect border-2 border-success/30 text-neutral-700 hover:border-success/60'
                      }`}
                    >
                      <CheckCircle className="inline mr-2" size={16} />
                      {discussion.isSolved ? 'SOLVED' : 'MARK SOLVED'}
                    </button>
                    <button
                      onClick={() => deleteDiscussion(discussion.id)}
                      className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                    >
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Share2,
  Flag,
  Pin,
  Lock,
  CheckCircle,
  Tag,
  Clock,
  User,
  Send,
  Reply,
  MoreVertical,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/services'
import { useToast } from '@/lib/hooks'
import DOMPurify from 'dompurify'

interface DiscussionReply {
  id: string
  content: string
  createdAt: string
  isSolution: boolean
  user: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    role: string
  }
  _count: {
    likes: number
    replies: number
  }
}

interface DiscussionDetail {
  id: string
  title: string
  content: string
  status: string
  category: string
  tags: string[]
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
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
  }
  replies: DiscussionReply[]
  _count: {
    likes: number
    replies: number
  }
}

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export default function DiscussionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const discussionId = params.id as string

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    fetchDiscussion()
  }, [discussionId])

  useEffect(() => {
    if (!discussion) return

    const elements = document.querySelectorAll('.discussion-detail-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [discussion])

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`/discussions/${discussionId}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setDiscussion(apiData.data)
      } else {
        setError(response.error || 'Failed to fetch discussion')
      }
    } catch (err) {
      console.error('Error fetching discussion:', err)
      setError(err instanceof Error ? err.message : 'Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-secondary mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading discussion...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !discussion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-danger" size={48} />
          <h2 className="text-2xl font-black text-neutral-800 mb-4">DISCUSSION NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">
            {error || "The discussion you're looking for doesn't exist."}
          </p>
          <Link href="/discussions">
            <MagneticButton className="bg-gradient-to-r from-secondary to-purple-600 text-white font-black">
              BACK TO DISCUSSIONS
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const handleLike = async () => {
    try {
      const response = await apiClient.post(`/discussions/${discussionId}/like`, {})
      if (response.status >= 200 && response.status < 300) {
        const data = response.data as { liked: boolean }
        setIsLiked(data.liked)
        // Refresh to update like count
        fetchDiscussion()
      }
    } catch (err) {
      console.error('Error liking discussion:', err)
    }
  }

  const handleReplyLike = async (replyId: string) => {
    try {
      const response = await apiClient.post(`/discussions/${discussionId}/like`, { replyId })
      if (response.status >= 200 && response.status < 300) {
        // Refresh to update like count
        fetchDiscussion()
      }
    } catch (err) {
      console.error('Error liking reply:', err)
    }
  }

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return

    try {
      const response = await apiClient.post(`/discussions/${discussionId}/replies`, {
        content: replyText.trim()
      })

      if (response.status >= 200 && response.status < 300) {
        setReplyText('')
        fetchDiscussion() // Refresh to show new reply
        toast({
          title: 'Reply Posted',
          description: 'Your reply has been posted successfully.',
        })
      } else {
        const errorData = response.data as { message?: string }
        toast({
          title: 'Error',
          description: errorData?.message || 'Failed to submit reply. Please try again.',
          variant: 'destructive',
        })
      }
    } catch (err) {
      console.error('Error submitting reply:', err)
      toast({
        title: 'Error',
        description: 'Failed to submit reply. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const authorName = `${discussion.user.firstName} ${discussion.user.lastName}`
  const createdAtFormatted = formatRelativeTime(discussion.createdAt)
  const updatedAtFormatted = formatRelativeTime(discussion.updatedAt)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="discussion-detail-item opacity-0">
        <button
          onClick={() => router.push('/discussions')}
          className="flex items-center gap-2 text-neutral-700 hover:text-secondary font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO DISCUSSIONS
        </button>
      </div>

      {/* Discussion Header */}
      <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
        <CardContent className="p-6 md:p-8">
          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {discussion.isPinned && (
              <div className="flex items-center gap-1 text-warning">
                <Pin size={16} />
                <span className="text-xs font-black">PINNED</span>
              </div>
            )}
            {discussion.isLocked && (
              <div className="flex items-center gap-1 text-neutral-500">
                <Lock size={16} />
                <span className="text-xs font-black">LOCKED</span>
              </div>
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

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-black text-neutral-800 mb-4">
            {discussion.title}
          </h1>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-4">
            {discussion.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 flex items-center gap-1"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="font-black text-neutral-800">{authorName}</p>
                <p className="text-sm text-neutral-600">{discussion.user.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{createdAtFormatted}</span>
              </div>
              <div>
                {discussion.viewCount} views
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="mt-4">
            <Link href={`/courses/${discussion.course.id}`}>
              <p className="text-sm font-bold text-primary hover:text-secondary transition-colors">
                Posted in: {discussion.course.title}
              </p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Discussion Content */}
      <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardContent className="p-6 md:p-8">
          <div className="prose prose-neutral max-w-none">
            <div
              className="text-neutral-700 leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  discussion.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                )
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6 pt-6 border-t-2 border-neutral-200">
            <MagneticButton
              onClick={handleLike}
              className={`${
                isLiked
                  ? 'bg-gradient-to-r from-danger to-red-600 text-white'
                  : 'glass-effect border-2 border-danger/30 text-neutral-700'
              } font-black`}
            >
              <ThumbsUp size={18} className="mr-2" />
              {discussion._count.likes} LIKES
            </MagneticButton>

            <MagneticButton
              onClick={() => {
                // Copy discussion URL to clipboard
                const url = window.location.href
                navigator.clipboard.writeText(url)
                toast({
                  title: 'Link Copied',
                  description: 'Discussion link has been copied to clipboard',
                })
              }}
              className="glass-effect border-2 border-primary/30 text-neutral-700 font-black"
            >
              <Share2 size={18} className="mr-2" />
              SHARE
            </MagneticButton>

            <MagneticButton
              onClick={() => {
                toast({
                  title: 'Report Submitted',
                  description: 'Thank you for reporting this discussion. Our moderation team will review it shortly.',
                })
              }}
              className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black"
            >
              <Flag size={18} className="mr-2" />
              REPORT
            </MagneticButton>
          </div>
        </CardContent>
      </Card>

      {/* Replies Section */}
      <div className="discussion-detail-item opacity-0">
        <h2 className="text-2xl font-black text-neutral-800 mb-4 flex items-center gap-2">
          <MessageCircle size={24} />
          {discussion.replies.length} {discussion.replies.length === 1 ? 'REPLY' : 'REPLIES'}
        </h2>
      </div>

      {/* Reply Cards */}
      {discussion.replies.map((reply) => (
        <Card
          key={reply.id}
          className={`discussion-detail-item opacity-0 glass-effect concrete-texture border-4 ${
            reply.isSolution
              ? 'border-success/40 bg-success/5'
              : 'border-neutral-300'
          }`}
        >
          <CardContent className="p-6">
            {reply.isSolution && (
              <div className="flex items-center gap-2 mb-4 text-success">
                <CheckCircle size={20} />
                <span className="font-black text-sm">MARKED AS SOLUTION</span>
              </div>
            )}

            {/* Reply Author */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-black text-neutral-800">{reply.user.firstName} {reply.user.lastName}</p>
                  <p className="text-sm text-neutral-600">{reply.user.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">{formatRelativeTime(reply.createdAt)}</span>
                <button className="text-neutral-400 hover:text-neutral-700">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Reply Content */}
            <div className="prose prose-neutral max-w-none mb-4">
              <div
                className="text-neutral-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(
                    reply.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/@(\w+)/g, '<span class="text-primary font-bold">@$1</span>')
                      .replace(/❌/g, '<span class="text-danger">❌</span>')
                  )
                }}
              />
            </div>

            {/* Reply Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleReplyLike(reply.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold glass-effect border-2 border-danger/30 text-neutral-700 hover:border-danger/60 transition-all"
              >
                <ThumbsUp size={14} />
                {reply._count.likes}
              </button>

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60 transition-all">
                <Reply size={14} />
                REPLY
              </button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Reply Form */}
      {!discussion.isLocked && (
        <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-neutral-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              ADD YOUR REPLY
            </h3>

            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Share your thoughts, insights, or questions..."
              className="min-h-32 glass-effect border-2 border-success/30 focus:border-success font-medium mb-4"
            />

            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                <strong>Tip:</strong> Use @username to mention someone, **bold** for emphasis
              </p>

              <MagneticButton
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} className="mr-2" />
                POST REPLY
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      )}

      {discussion.isLocked && (
        <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="p-6 text-center">
            <Lock className="mx-auto mb-3 text-neutral-500" size={32} />
            <h3 className="text-xl font-black text-neutral-700 mb-2">DISCUSSION LOCKED</h3>
            <p className="text-neutral-600">
              This discussion has been locked and new replies are not allowed.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

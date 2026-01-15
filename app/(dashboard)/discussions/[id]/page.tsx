'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LoadingState, ErrorState } from '@/components/ui/page-states'
import { useEntranceAnimation, useToast } from '@/lib/hooks'
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
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/services'
import DOMPurify from 'dompurify'
import { ReplyCard, ReplyForm, type ReplyData } from '@/components/discussions'

type DiscussionReply = ReplyData

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

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.discussion-detail-item', staggerDelay: 0.05 }, [discussion])

  useEffect(() => {
    fetchDiscussion()
  }, [discussionId])

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`/discussions/${discussionId}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as { data: DiscussionDetail }
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
    return <LoadingState message="Loading discussion..." size="lg" />
  }

  // Error state
  if (error || !discussion) {
    return (
      <div className="space-y-4">
        <ErrorState
          title="Discussion Not Found"
          message={error || "The discussion you're looking for doesn't exist."}
          onRetry={fetchDiscussion}
        />
        <div className="text-center">
          <Link href="/discussions" aria-label="Back to all discussions">
            <MagneticButton className="bg-gradient-to-r from-secondary to-purple-600 text-white font-black">
              BACK TO DISCUSSIONS
            </MagneticButton>
          </Link>
        </div>
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
      } else {
        throw new Error('Failed to like discussion')
      }
    } catch (err) {
      console.error('Error liking discussion:', err)
      toast({
        title: 'Error',
        description: 'Failed to like discussion. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleReplyLike = async (replyId: string) => {
    try {
      const response = await apiClient.post(`/discussions/${discussionId}/like`, { replyId })
      if (response.status >= 200 && response.status < 300) {
        // Refresh to update like count
        fetchDiscussion()
      } else {
        throw new Error('Failed to like reply')
      }
    } catch (err) {
      console.error('Error liking reply:', err)
      toast({
        title: 'Error',
        description: 'Failed to like reply. Please try again.',
        variant: 'destructive',
      })
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
    <div className="space-y-6" role="main" aria-label="Discussion detail">
      {/* Back Button */}
      <nav className="discussion-detail-item opacity-0" aria-label="Navigation">
        <button
          onClick={() => router.push('/discussions')}
          className="flex items-center gap-2 text-neutral-700 hover:text-secondary font-bold transition-colors"
          aria-label="Back to discussions list"
        >
          <ArrowLeft size={20} aria-hidden="true" />
          BACK TO DISCUSSIONS
        </button>
      </nav>

      {/* Discussion Header */}
      <article className="discussion-detail-item opacity-0">
        <Card className="glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 md:p-8">
            {/* Meta Info */}
            <div className="flex items-center gap-3 mb-4 flex-wrap" role="group" aria-label="Discussion status">
              {discussion.isPinned && (
                <span className="flex items-center gap-1 text-warning" aria-label="Pinned discussion">
                  <Pin size={16} aria-hidden="true" />
                  <span className="text-xs font-black">PINNED</span>
                </span>
              )}
              {discussion.isLocked && (
                <span className="flex items-center gap-1 text-neutral-500" aria-label="Locked discussion">
                  <Lock size={16} aria-hidden="true" />
                  <span className="text-xs font-black">LOCKED</span>
                </span>
              )}
              {discussion.isSolved && (
                <span className="flex items-center gap-1 text-success" aria-label="Solved discussion">
                  <CheckCircle size={16} aria-hidden="true" />
                  <span className="text-xs font-black">SOLVED</span>
                </span>
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
            {Array.isArray(discussion.tags) && discussion.tags.length > 0 && (
              <ul className="flex items-center gap-2 flex-wrap mb-4" aria-label="Discussion tags">
                {discussion.tags.map((tag, index) => (
                  <li
                    key={index}
                    className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 flex items-center gap-1"
                  >
                    <Tag size={12} aria-hidden="true" />
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b-2 border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center" aria-hidden="true">
                  <User className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-black text-neutral-800">{authorName}</p>
                  <p className="text-sm text-neutral-600">{discussion.user.role}</p>
                </div>
              </div>

              <dl className="flex items-center gap-4 text-sm font-semibold text-neutral-600">
                <div className="flex items-center gap-1">
                  <Clock size={14} aria-hidden="true" />
                  <dt className="sr-only">Posted</dt>
                  <dd><time dateTime={discussion.createdAt}>{createdAtFormatted}</time></dd>
                </div>
                <div>
                  <dt className="sr-only">Views</dt>
                  <dd>{discussion.viewCount} views</dd>
                </div>
              </dl>
            </div>

            {/* Course Info */}
            {discussion.course && (
              <div className="mt-4">
                <Link href={`/courses/${discussion.course.id}`} aria-label={`View course: ${discussion.course.title}`}>
                  <p className="text-sm font-bold text-primary hover:text-secondary transition-colors">
                    Posted in: {discussion.course.title}
                  </p>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </article>

      {/* Discussion Content */}
      <section className="discussion-detail-item opacity-0" aria-labelledby="discussion-content-heading">
        <h2 id="discussion-content-heading" className="sr-only">Discussion Content</h2>
        <Card className="glass-effect concrete-texture border-4 border-primary/40">
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
            <div className="flex items-center gap-4 mt-6 pt-6 border-t-2 border-neutral-200" role="group" aria-label="Discussion actions">
              <MagneticButton
                onClick={handleLike}
                aria-pressed={isLiked}
                aria-label={`${isLiked ? 'Unlike' : 'Like'} this discussion, ${discussion._count.likes} likes`}
                className={`${
                  isLiked
                    ? 'bg-gradient-to-r from-danger to-red-600 text-white'
                    : 'glass-effect border-2 border-danger/30 text-neutral-700'
                } font-black`}
              >
                <ThumbsUp size={18} className="mr-2" aria-hidden="true" />
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
                aria-label="Copy discussion link to clipboard"
              >
                <Share2 size={18} className="mr-2" aria-hidden="true" />
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
                aria-label="Report this discussion"
              >
                <Flag size={18} className="mr-2" aria-hidden="true" />
                REPORT
              </MagneticButton>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Replies Section */}
      <section className="discussion-detail-item opacity-0" aria-labelledby="replies-heading">
        <h2 id="replies-heading" className="text-2xl font-black text-neutral-800 mb-4 flex items-center gap-2">
          <MessageCircle size={24} aria-hidden="true" />
          {discussion.replies.length} {discussion.replies.length === 1 ? 'REPLY' : 'REPLIES'}
        </h2>

        {/* Reply Cards */}
        <ul role="list" aria-label={`${discussion.replies.length} replies`} className="space-y-4">
          {discussion.replies.map((reply) => (
            <li key={reply.id}>
              <ReplyCard
                reply={reply}
                onLike={handleReplyLike}
                formatDate={formatRelativeTime}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Add Reply Form */}
      <section className="discussion-detail-item opacity-0" aria-labelledby="reply-form-heading">
        <h2 id="reply-form-heading" className="sr-only">Add a reply</h2>
        <ReplyForm
          replyText={replyText}
          onReplyTextChange={setReplyText}
          onSubmit={handleSubmitReply}
          isLocked={discussion.isLocked}
        />
      </section>
    </div>
  )
}

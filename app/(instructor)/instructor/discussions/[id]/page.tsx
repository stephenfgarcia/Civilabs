'use client'

import { useEffect, useState } from 'react'
import { use Params } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  MessageSquare,
  User,
  Clock,
  ThumbsUp,
  CheckCircle,
  Lock,
  Flag,
  Pin,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import DOMPurify from 'dompurify'

interface Discussion {
  id: string
  title: string
  content: string
  courseName: string
  courseId: string
  user: {
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt: string
  repliesCount: number
  isPinned: boolean
  isLocked: boolean
  isFlagged: boolean
  isSolved: boolean
  replies: Reply[]
}

interface Reply {
  id: string
  content: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

export default function DiscussionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAuth(['INSTRUCTOR'])
  const { toast } = useToast()
  const resolvedParams = use(params)
  const discussionId = resolvedParams.id

  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDiscussion()
  }, [discussionId])

  const fetchDiscussion = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/instructor/discussions/${discussionId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load discussion')
      }

      setDiscussion(data.data)
    } catch (err) {
      console.error('Error fetching discussion:', err)
      setError(err instanceof Error ? err.message : 'Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Reply cannot be empty',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/instructor/discussions/${discussionId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: replyText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to post reply')
      }

      toast({
        title: 'Reply Posted',
        description: 'Your reply has been posted successfully',
      })

      setReplyText('')
      fetchDiscussion() // Refresh to show new reply
    } catch (err) {
      console.error('Error posting reply:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to post reply',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading discussion...</p>
        </div>
      </div>
    )
  }

  if (error || !discussion) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-red-500/40 max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2 text-red-600">
              <AlertCircle />
              Error Loading Discussion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 mb-4">{error || 'Discussion not found'}</p>
            <Link href="/instructor/discussions">
              <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                <ArrowLeft className="mr-2" size={18} />
                BACK TO DISCUSSIONS
              </MagneticButton>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const authorName = `${discussion.user.firstName} ${discussion.user.lastName}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect concrete-texture rounded-xl p-6 border-4 border-primary/40">
        <Link href="/instructor/discussions">
          <MagneticButton className="mb-4 bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
            <ArrowLeft className="mr-2" size={20} />
            BACK TO DISCUSSIONS
          </MagneticButton>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-neutral-800">
              {discussion.title}
            </h1>
            <p className="text-sm font-bold text-neutral-600 mt-1">
              {discussion.courseName}
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          {discussion.isPinned && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning flex items-center gap-1">
              <Pin size={12} />
              PINNED
            </span>
          )}
          {discussion.isLocked && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-neutral-200 text-neutral-600 flex items-center gap-1">
              <Lock size={12} />
              LOCKED
            </span>
          )}
          {discussion.isSolved && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success flex items-center gap-1">
              <CheckCircle size={12} />
              SOLVED
            </span>
          )}
          {discussion.isFlagged && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-danger/20 text-danger flex items-center gap-1">
              <Flag size={12} />
              FLAGGED
            </span>
          )}
        </div>
      </div>

      {/* Original Post */}
      <Card className="glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              <div>
                <p className="font-black text-neutral-800">{authorName}</p>
                <p className="text-xs text-neutral-500">
                  Posted {new Date(discussion.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                discussion.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Replies */}
      <Card className="glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <MessageSquare className="text-secondary" size={24} />
            REPLIES ({discussion.replies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {discussion.replies.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <p className="text-neutral-600 font-semibold">No replies yet</p>
              <p className="text-neutral-500 text-sm mt-1">Be the first to respond to this discussion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discussion.replies.map((reply) => (
                <div
                  key={reply.id}
                  className="glass-effect border-2 border-secondary/30 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-800">
                        {reply.user.firstName} {reply.user.lastName}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className="prose prose-sm prose-neutral max-w-none text-neutral-700"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        reply.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      )
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Form */}
      {!discussion.isLocked && (
        <Card className="glass-effect concrete-texture border-4 border-success/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <Send className="text-success" size={20} />
              POST A REPLY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write your reply here..."
                className="glass-effect border-2 border-success/30 focus:border-success min-h-[120px]"
                disabled={submitting}
              />
              <MagneticButton
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50"
              >
                <Send className="mr-2" size={18} />
                {submitting ? 'POSTING...' : 'POST REPLY'}
              </MagneticButton>
            </form>
          </CardContent>
        </Card>
      )}

      {discussion.isLocked && (
        <Card className="glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="p-6 text-center">
            <Lock className="mx-auto h-12 w-12 text-neutral-400 mb-3" />
            <p className="font-bold text-neutral-700">This discussion is locked</p>
            <p className="text-neutral-500 text-sm mt-1">
              No new replies can be added to this discussion
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

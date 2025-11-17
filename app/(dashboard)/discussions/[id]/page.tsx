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
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import { Textarea } from '@/components/ui/textarea'

interface DiscussionReply {
  id: number
  author: string
  authorAvatar?: string
  authorRole: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  isSolution: boolean
  replies?: DiscussionReply[]
}

interface DiscussionDetail {
  id: number
  title: string
  author: string
  authorAvatar?: string
  authorRole: string
  category: string
  course: string
  createdAt: string
  lastActivity: string
  views: number
  likes: number
  isLiked: boolean
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  tags: string[]
  content: string
  replies: DiscussionReply[]
}

// Mock discussion detail data
const MOCK_DISCUSSION_DETAIL: { [key: number]: DiscussionDetail } = {
  1: {
    id: 1,
    title: 'Best practices for fall protection systems?',
    author: 'Mike Chen',
    authorRole: 'Advanced Learner',
    category: 'Safety',
    course: 'Construction Safety Fundamentals',
    createdAt: '2 hours ago',
    lastActivity: '15 minutes ago',
    views: 245,
    likes: 34,
    isLiked: false,
    isPinned: true,
    isLocked: false,
    isSolved: true,
    tags: ['Fall Protection', 'OSHA', 'Safety'],
    content: `Looking for recommendations on the most effective fall protection systems for high-rise construction projects. We're working on a 20-story building and need to ensure maximum safety for our crew.

I've reviewed the course materials on fall protection, but I'm curious about real-world experiences with different systems:

1. **Guardrail Systems** - Are these practical for high-rise?
2. **Personal Fall Arrest Systems (PFAS)** - What's the best harness configuration?
3. **Safety Net Systems** - When are these the best option?

Also, what are the key OSHA requirements we need to keep in mind? The course covered the basics, but I'd love to hear from those who have implemented these systems on actual projects.

Any insights would be greatly appreciated!`,
    replies: [
      {
        id: 1,
        author: 'Sarah Johnson',
        authorRole: 'Safety Inspector',
        content: `Great question, Mike! I've worked on several high-rise projects and here's my take:

For buildings over 15 stories, I strongly recommend a combination approach:

**Primary: PFAS with proper anchor points**
- Use full-body harnesses (not waist belts)
- Install permanent anchor points every 15 feet
- Ensure shock-absorbing lanyards are rated for the work height

**Secondary: Edge protection wherever possible**
- Guardrails on all floor edges before concrete pour
- Toe boards to prevent falling objects

**OSHA 1926.501(b)(1)** requires fall protection at 6 feet for construction. For high-rise, you'll also need:
- Competent person on-site for inspections
- Regular equipment checks (every 6 months minimum)
- Proper training documentation

The key is redundancy - never rely on a single system!`,
        createdAt: '1 hour ago',
        likes: 28,
        isLiked: true,
        isSolution: true
      },
      {
        id: 2,
        author: 'David Martinez',
        authorRole: 'Equipment Specialist',
        content: `I'll add to Sarah's excellent points. From an equipment perspective:

**Harness Selection:**
- Look for ANSI Z359.11 certified harnesses
- Dorsal D-ring for standard fall arrest
- Front D-ring if you need rescue capabilities
- Padding for comfort during long work periods

**Common Mistakes to Avoid:**
1. ❌ Using damaged equipment (check before every use!)
2. ❌ Incorrect anchor points (must support 5,000 lbs per person)
3. ❌ Improper fit (harness should be snug but not restrictive)

Also, don't forget about rescue plans! OSHA requires a plan to rescue a fallen worker within 6 minutes to prevent suspension trauma.`,
        createdAt: '45 minutes ago',
        likes: 15,
        isLiked: false,
        isSolution: false
      },
      {
        id: 3,
        author: 'Mike Chen',
        authorRole: 'Advanced Learner',
        content: `Thank you both! This is exactly the kind of practical advice I was looking for.

@Sarah - The redundancy point is crucial. We were planning to rely primarily on PFAS, but I see now that edge protection should be our first line of defense where possible.

@David - Great reminder about the rescue plan. That's something we hadn't fully developed yet. The 6-minute window is critical info.

I'm marking Sarah's response as the solution since it directly addresses the OSHA requirements and system selection. But both answers are incredibly helpful!`,
        createdAt: '30 minutes ago',
        likes: 8,
        isLiked: false,
        isSolution: false
      },
      {
        id: 4,
        author: 'Jennifer Lee',
        authorRole: 'Course Instructor',
        content: `Excellent discussion everyone! This is a perfect real-world application of the course material.

I'd like to add one more resource: OSHA's Fall Protection guide (Publication 3146) has excellent diagrams and decision trees for selecting the right system.

Also, consider reaching out to your local OSHA consultation program - they offer free assistance for safety planning and are an incredible resource for high-risk projects like high-rise construction.

Keep up the great collaborative learning! 🏗️`,
        createdAt: '15 minutes ago',
        likes: 12,
        isLiked: true,
        isSolution: false
      }
    ]
  },
  2: {
    id: 2,
    title: 'Quiz 2 - OSHA Regulations clarification needed',
    author: 'Sarah Johnson',
    authorRole: 'New Learner',
    category: 'Questions',
    course: 'Construction Safety Fundamentals',
    createdAt: '5 hours ago',
    lastActivity: '1 hour ago',
    views: 156,
    likes: 23,
    isLiked: false,
    isPinned: false,
    isLocked: false,
    isSolved: false,
    tags: ['Quiz Help', 'OSHA'],
    content: `Can someone explain the difference between 1926.500 and 1926.501 regulations? I got confused on question 5 of Quiz 2.

The question asks which regulation covers "duty to have fall protection" and I'm not sure if that's 1926.500 (scope and definitions) or 1926.501 (duty to have fall protection).

The course materials mention both, but I want to make sure I understand the distinction before I retake the quiz.

Thanks in advance!`,
    replies: [
      {
        id: 1,
        author: 'Tom Wilson',
        authorRole: 'Advanced Learner',
        content: `Hey Sarah! I just completed this quiz yesterday. Here's the breakdown:

**1926.500** - Scope, Application, and Definitions
- This section defines WHAT fall protection is
- Covers terminology and when the regulations apply

**1926.501** - Duty to Have Fall Protection
- This section specifies WHEN you must use fall protection
- Covers specific situations (leading edges, holes, roofs, etc.)

So for question 5, if it's asking about the "duty to have" fall protection, that's **1926.501**.

Hope this helps!`,
        createdAt: '3 hours ago',
        likes: 18,
        isLiked: false,
        isSolution: false
      },
      {
        id: 2,
        author: 'Sarah Johnson',
        authorRole: 'New Learner',
        content: `That makes perfect sense now! So 1926.500 is the "what" and 1926.501 is the "when".

Thank you so much, Tom! I'll retake the quiz now with this understanding.`,
        createdAt: '1 hour ago',
        likes: 5,
        isLiked: false,
        isSolution: false
      }
    ]
  }
}

export default function DiscussionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const discussionId = parseInt(params.id as string)

  const [discussion, setDiscussion] = useState<DiscussionDetail | null>(
    MOCK_DISCUSSION_DETAIL[discussionId]
  )
  const [replyText, setReplyText] = useState('')
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    if (discussion) {
      setIsLiked(discussion.isLiked)
    }
  }, [discussion])

  useEffect(() => {
    if (!discussion) return

    const elements = document.querySelectorAll('.discussion-detail-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [discussion])

  if (!discussion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center">
          <h2 className="text-2xl font-black text-neutral-800 mb-4">DISCUSSION NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">
            The discussion you're looking for doesn't exist.
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

  const handleLike = () => {
    setIsLiked(!isLiked)
    setDiscussion({
      ...discussion,
      likes: isLiked ? discussion.likes - 1 : discussion.likes + 1,
      isLiked: !isLiked
    })
  }

  const handleReplyLike = (replyId: number) => {
    setDiscussion({
      ...discussion,
      replies: discussion.replies.map(reply =>
        reply.id === replyId
          ? {
              ...reply,
              likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
              isLiked: !reply.isLiked
            }
          : reply
      )
    })
  }

  const handleSubmitReply = () => {
    if (!replyText.trim()) return

    // Mock reply submission
    alert(`Reply submitted: ${replyText}`)
    setReplyText('')
  }

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
                <p className="font-black text-neutral-800">{discussion.author}</p>
                <p className="text-sm text-neutral-600">{discussion.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm font-semibold text-neutral-600">
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{discussion.createdAt}</span>
              </div>
              <div>
                {discussion.views} views
              </div>
            </div>
          </div>

          {/* Course Info */}
          <div className="mt-4">
            <Link href={`/courses/${1}`}>
              <p className="text-sm font-bold text-primary hover:text-secondary transition-colors">
                Posted in: {discussion.course}
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
              dangerouslySetInnerHTML={{ __html: discussion.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
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
              {discussion.likes} LIKES
            </MagneticButton>

            <MagneticButton className="glass-effect border-2 border-primary/30 text-neutral-700 font-black">
              <Share2 size={18} className="mr-2" />
              SHARE
            </MagneticButton>

            <MagneticButton className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black">
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
                  <p className="font-black text-neutral-800">{reply.author}</p>
                  <p className="text-sm text-neutral-600">{reply.authorRole}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-500">{reply.createdAt}</span>
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
                  __html: reply.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/@(\w+)/g, '<span class="text-primary font-bold">@$1</span>')
                    .replace(/❌/g, '<span class="text-danger">❌</span>')
                }}
              />
            </div>

            {/* Reply Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleReplyLike(reply.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  reply.isLiked
                    ? 'bg-gradient-to-r from-danger to-red-600 text-white'
                    : 'glass-effect border-2 border-danger/30 text-neutral-700 hover:border-danger/60'
                }`}
              >
                <ThumbsUp size={14} />
                {reply.likes}
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

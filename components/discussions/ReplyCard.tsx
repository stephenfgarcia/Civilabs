'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  ThumbsUp,
  User,
  Reply,
  MoreVertical,
  CheckCircle,
} from 'lucide-react'
import DOMPurify from 'dompurify'

export interface ReplyData {
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

interface ReplyCardProps {
  reply: ReplyData
  onLike: (replyId: string) => void
  onReply?: (replyId: string) => void
  formatDate: (date: string) => string
}

export function ReplyCard({ reply, onLike, onReply, formatDate }: ReplyCardProps) {
  return (
    <Card
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
            <span className="text-sm text-neutral-500">{formatDate(reply.createdAt)}</span>
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
              )
            }}
          />
        </div>

        {/* Reply Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => onLike(reply.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold glass-effect border-2 border-danger/30 text-neutral-700 hover:border-danger/60 transition-all"
          >
            <ThumbsUp size={14} />
            {reply._count.likes}
          </button>

          {onReply && (
            <button
              onClick={() => onReply(reply.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold glass-effect border-2 border-primary/30 text-neutral-700 hover:border-primary/60 transition-all"
            >
              <Reply size={14} />
              REPLY
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ReplyCard

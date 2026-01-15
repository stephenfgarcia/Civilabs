'use client'

import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send, Lock } from 'lucide-react'

interface ReplyFormProps {
  replyText: string
  onReplyTextChange: (text: string) => void
  onSubmit: () => void
  isLocked: boolean
  isSubmitting?: boolean
}

export function ReplyForm({
  replyText,
  onReplyTextChange,
  onSubmit,
  isLocked,
  isSubmitting = false,
}: ReplyFormProps) {
  if (isLocked) {
    return (
      <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
        <CardContent className="p-6 text-center">
          <Lock className="mx-auto mb-3 text-neutral-500" size={32} />
          <h3 className="text-xl font-black text-neutral-700 mb-2">DISCUSSION LOCKED</h3>
          <p className="text-neutral-600">
            This discussion has been locked and new replies are not allowed.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="discussion-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
      <CardContent className="p-6">
        <h3 className="text-xl font-black text-neutral-800 mb-4 flex items-center gap-2">
          <MessageCircle size={20} />
          ADD YOUR REPLY
        </h3>

        <Textarea
          value={replyText}
          onChange={(e) => onReplyTextChange(e.target.value)}
          placeholder="Share your thoughts, insights, or questions..."
          className="min-h-32 glass-effect border-2 border-success/30 focus:border-success font-medium mb-4"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            <strong>Tip:</strong> Use @username to mention someone, **bold** for emphasis
          </p>

          <MagneticButton
            onClick={onSubmit}
            disabled={!replyText.trim() || isSubmitting}
            className="bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} className="mr-2" />
            {isSubmitting ? 'POSTING...' : 'POST REPLY'}
          </MagneticButton>
        </div>
      </CardContent>
    </Card>
  )
}

export default ReplyForm

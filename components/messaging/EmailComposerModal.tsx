/**
 * EmailComposerModal Component
 * Modal for composing and sending bulk emails to students
 */

'use client'

import { useState } from 'react'
import { X, Send, Loader2, Users } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'

interface EmailComposerModalProps {
  isOpen: boolean
  onClose: () => void
  courseId?: string
  courseName?: string
  onSuccess?: () => void
}

export function EmailComposerModal({
  isOpen,
  onClose,
  courseId,
  courseName,
  onSuccess,
}: EmailComposerModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    recipientCount: number
    message: string
  } | null>(null)

  const handleSend = async () => {
    if (!subject.trim() || !message.trim() || sending) return

    try {
      setSending(true)
      setResult(null)

      const response = await fetch('/api/instructor/students/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject.trim(),
          message: message.trim(),
          courseId: courseId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email')
      }

      setResult({
        success: true,
        recipientCount: data.data.recipientCount,
        message: data.message,
      })

      // Clear form after 2 seconds and close
      setTimeout(() => {
        setSubject('')
        setMessage('')
        setResult(null)
        onSuccess?.()
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error sending email:', error)
      setResult({
        success: false,
        recipientCount: 0,
        message: error instanceof Error ? error.message : 'Failed to send email',
      })
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col border-4 border-primary/40">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200">
          <div>
            <h2 className="text-2xl font-black text-neutral-800">SEND BULK EMAIL</h2>
            <p className="text-sm font-medium text-neutral-600 mt-1">
              {courseName ? `To: Students in "${courseName}"` : 'To: All your students'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            disabled={sending}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-black text-neutral-700 mb-2">
              SUBJECT *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg font-medium focus:border-primary focus:outline-none"
              disabled={sending}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-black text-neutral-700 mb-2">
              MESSAGE *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full px-4 py-3 border-2 border-neutral-300 rounded-lg font-medium focus:border-primary focus:outline-none resize-none"
              rows={12}
              disabled={sending}
            />
            <p className="text-xs text-neutral-500 font-medium mt-2">
              This email will be sent as a notification to students. They will receive it in their
              notifications panel.
            </p>
          </div>

          {/* Result Message */}
          {result && (
            <div
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-success/10 border-success text-success'
                  : 'bg-danger/10 border-danger text-danger'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.success ? (
                  <Users className="flex-shrink-0" size={24} />
                ) : (
                  <X className="flex-shrink-0" size={24} />
                )}
                <div>
                  <p className="font-black">{result.message}</p>
                  {result.success && result.recipientCount > 0 && (
                    <p className="text-sm font-medium mt-1">
                      Notifications created for {result.recipientCount} student
                      {result.recipientCount !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-primary/5 border-2 border-primary/20 rounded-lg">
            <p className="text-sm font-bold text-neutral-700">
              <span className="font-black text-primary">Note:</span> Students will receive this as
              a notification in the platform. For important announcements, consider also using their
              email addresses directly.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-2 border-neutral-200">
          <div className="flex items-center justify-end gap-3">
            <MagneticButton
              onClick={onClose}
              disabled={sending}
              className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black"
            >
              CANCEL
            </MagneticButton>
            <MagneticButton
              onClick={handleSend}
              disabled={!subject.trim() || !message.trim() || sending}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  SENDING...
                </>
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  SEND EMAIL
                </>
              )}
            </MagneticButton>
          </div>
        </div>
      </Card>
    </div>
  )
}

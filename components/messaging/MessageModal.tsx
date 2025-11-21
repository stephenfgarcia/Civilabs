/**
 * MessageModal Component
 * Modal for sending messages to users
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'

interface Message {
  id: string
  content: string
  senderId: string
  sender: {
    id: string
    firstName: string
    lastName: string
    avatarUrl?: string
    role: string
  }
  status: string
  createdAt: string
}

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: string
  recipientName: string
}

export function MessageModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: MessageModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load or create conversation when modal opens
  useEffect(() => {
    if (isOpen && recipientId) {
      loadConversation()
    }
  }, [isOpen, recipientId])

  const loadConversation = async () => {
    try {
      setLoading(true)

      // Create or get conversation
      const convResponse = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: recipientId }),
      })

      if (!convResponse.ok) {
        throw new Error('Failed to load conversation')
      }

      const convData = await convResponse.json()
      const convId = convData.data.id
      setConversationId(convId)

      // Load messages
      const messagesResponse = await fetch(`/api/messages?conversationId=${convId}`)
      if (!messagesResponse.ok) {
        throw new Error('Failed to load messages')
      }

      const messagesData = await messagesResponse.json()
      setMessages(messagesData.data || [])
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || sending) return

    try {
      setSending(true)

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newMessage.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()
      setMessages((prev) => [...prev, data.data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col border-4 border-primary/40">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-neutral-200">
          <div>
            <h2 className="text-2xl font-black text-neutral-800">Message</h2>
            <p className="text-sm font-medium text-neutral-600 mt-1">
              To: {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] max-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-neutral-500 font-medium">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender.id !== recipientId
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-4 ${
                      isMe
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {!isMe && (
                      <p className="text-xs font-bold mb-1">
                        {message.sender.firstName} {message.sender.lastName}
                      </p>
                    )}
                    <p className="font-medium whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-2 ${
                        isMe ? 'text-white/70' : 'text-neutral-500'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t-2 border-neutral-200">
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border-2 border-neutral-300 rounded-lg font-medium focus:border-primary focus:outline-none resize-none"
              rows={3}
              disabled={sending}
            />
            <MagneticButton
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="mr-2" size={20} />
                  SEND
                </>
              )}
            </MagneticButton>
          </div>
        </div>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react'
import { messagesService, type Conversation, type Message } from '@/lib/services'
import { useMessageStream } from '@/lib/hooks/useMessageStream'
import { useEntranceAnimation } from '@/lib/hooks'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/page-states'
import { formatDistanceToNow } from 'date-fns'
import { sanitizeSearchQuery } from '@/lib/utils/sanitize'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.message-item', staggerDelay: 0.03 }, [conversations, isLoading])

  useEffect(() => {
    loadConversations()
  }, [])

  // Real-time message streaming using SSE
  const { isConnected: isStreamConnected } = useMessageStream({
    conversationId: selectedConversation?.id || null,
    onNewMessages: (newMessages) => {
      // Add new messages to the list
      setMessages((prevMessages) => {
        // Filter out duplicates based on message ID
        const existingIds = new Set(prevMessages.map(m => m.id))
        const uniqueNewMessages = newMessages.filter(m => !existingIds.has(m.id))
        return [...prevMessages, ...uniqueNewMessages]
      })
    },
    onError: (error) => {
      console.error('[Messages] Stream error:', error)
    },
  })

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await messagesService.getConversations()
      setConversations(data)
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setError(error instanceof Error ? error.message : 'Failed to load conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await messagesService.getMessages(conversationId, { limit: 100 })
      setMessages(data.messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const newMessage = await messagesService.sendMessage(
        selectedConversation.id,
        messageText.trim()
      )
      setMessages([...messages, newMessage])
      setMessageText('')
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const getUserData = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  const currentUser = getUserData()

  // Filter conversations by search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true
    const name = `${conv.participant.firstName} ${conv.participant.lastName}`.toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  if (isLoading) {
    return <LoadingState message="Loading messages..." size="lg" />
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Messages"
        message={error}
        onRetry={loadConversations}
      />
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4" role="main" aria-label="Messages">
      {/* Conversations List */}
      <aside className="w-80 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col" aria-label="Conversations">
        <div className="p-4 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative" role="search">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
              maxLength={200}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Search conversations"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" role="list" aria-label="Conversation list">
          {filteredConversations.length === 0 ? (
            <EmptyState
              icon={<MessageSquare size={40} />}
              title="No conversations"
              description={searchQuery ? `No conversations match "${searchQuery}"` : "No conversations yet"}
            />
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                role="listitem"
                aria-selected={selectedConversation?.id === conversation.id}
                aria-label={`Conversation with ${conversation.participant.firstName} ${conversation.participant.lastName}${conversation.unreadCount > 0 ? `, ${conversation.unreadCount} unread` : ''}`}
                className={`message-item opacity-0 w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${ selectedConversation?.id === conversation.id ? 'bg-yellow-50' : '' }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200 flex-shrink-0" aria-hidden="true">
                    {conversation.participant.avatarUrl ? (
                      <Image
                        src={conversation.participant.avatarUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                        {conversation.participant.firstName?.[0] || '?'}
                        {conversation.participant.lastName?.[0] || ''}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conversation.participant.firstName} {conversation.participant.lastName}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full" aria-label={`${conversation.unreadCount} unread messages`}>
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    )}
                    {conversation.lastMessageAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        <time dateTime={new Date(conversation.lastMessageAt).toISOString()}>
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                          })}
                        </time>
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Messages Area */}
      <section className="flex-1 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col" aria-label="Message thread">
        {selectedConversation ? (
          <>
            {/* Header */}
            <header className="p-4 border-b-2 border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200" aria-hidden="true">
                {selectedConversation.participant.avatarUrl ? (
                  <Image
                    src={selectedConversation.participant.avatarUrl}
                    alt=""
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    {selectedConversation.participant.firstName?.[0] || '?'}
                    {selectedConversation.participant.lastName?.[0] || ''}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {selectedConversation.participant.firstName}{' '}
                  {selectedConversation.participant.lastName}
                </h3>
                <p className="text-xs text-gray-500 capitalize">
                  {selectedConversation.participant.role.toLowerCase()}
                </p>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" role="log" aria-label="Message history" aria-live="polite">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?.userId

                return (
                  <article
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    aria-label={`Message from ${isOwnMessage ? 'you' : selectedConversation.participant.firstName}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isOwnMessage
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-lg px-4 py-2`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-yellow-100' : 'text-gray-500'
                        }`}
                      >
                        <time dateTime={new Date(message.createdAt).toISOString()}>
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </time>
                      </p>
                    </div>
                  </article>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200" aria-label="Send a message">
              <div className="flex gap-2">
                <label htmlFor="message-input" className="sr-only">Type a message</label>
                <input
                  id="message-input"
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isSending}
                  aria-describedby={isSending ? 'sending-status' : undefined}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label={isSending ? 'Sending message...' : 'Send message'}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="w-4 h-4" aria-hidden="true" />
                  )}
                  Send
                </button>
                {isSending && <span id="sending-status" className="sr-only">Sending message...</span>}
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500" role="status">
            Select a conversation to start messaging
          </div>
        )}
      </section>
    </div>
  )
}

'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { Send, Search, MessageSquare, Loader2 } from 'lucide-react'
import { messagesService, type Conversation, type Message } from '@/lib/services'
import { formatDistanceToNow } from 'date-fns'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      // Auto-refresh messages every 5 seconds (will be replaced with WebSocket)
      const interval = setInterval(() => {
        loadMessages(selectedConversation.id)
      }, 5000)
      return () => clearInterval(interval)
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
    try {
      const data = await messagesService.getConversations()
      setConversations(data)
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <div className="w-80 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b-2 border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${ selectedConversation?.id === conversation.id ? 'bg-yellow-50' : '' }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
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
                        <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
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
                        {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-white rounded-lg border-2 border-gray-200 overflow-hidden flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b-2 border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200">
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
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwnMessage = message.senderId === currentUser?.userId

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
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
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isSending}
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || isSending}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

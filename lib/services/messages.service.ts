/**
 * Messages API Service
 * Handles direct messaging between users
 */

import { apiClient } from './api-client'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  createdAt: Date
  updatedAt: Date
  sender: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    role: string
  }
}

export interface Conversation {
  id: string
  participant: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
    role: string
  }
  lastMessage: {
    id: string
    content: string
    senderId: string
    status: string
    createdAt: Date
  } | null
  lastMessageAt: Date | null
  unreadCount: number
  createdAt: Date
}

class MessagesService {
  /**
   * Get all conversations for current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<{ conversations: Conversation[] }>('/conversations')
    return response.data?.conversations || []
  }

  /**
   * Create or get conversation with another user
   */
  async createConversation(participantId: string): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/conversations', { participantId })
    return response.data!
  }

  /**
   * Get messages in a conversation
   */
  async getMessages(
    conversationId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<{ messages: Message[]; total: number }> {
    const params = new URLSearchParams()
    params.append('conversationId', conversationId)

    if (options?.limit) {
      params.append('limit', String(options.limit))
    }
    if (options?.offset) {
      params.append('offset', String(options.offset))
    }

    const response = await apiClient.get<{ messages: Message[]; total: number }>(
      `/messages?${params.toString()}`
    )
    return {
      messages: response.data?.messages || [],
      total: response.data?.total || 0,
    }
  }

  /**
   * Send a message
   */
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', {
      conversationId,
      content,
    })
    return response.data!
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const conversations = await this.getConversations()
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0)
  }
}

export const messagesService = new MessagesService()
export default messagesService

/**
 * Discussions API Service
 * Handles all discussion forum API operations
 */

import { apiClient } from './api-client'

export interface Discussion {
  id: number
  title: string
  content: string
  category: string
  authorId: number
  author: {
    id: number
    name: string
    avatar?: string
  }
  isPinned: boolean
  isLocked: boolean
  isSolved: boolean
  replies: number
  likes: number
  views: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface DiscussionReply {
  id: number
  discussionId: number
  content: string
  authorId: number
  author: {
    id: number
    name: string
    avatar?: string
  }
  likes: number
  isLiked: boolean
  isSolution: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDiscussionData {
  title: string
  content: string
  category: string
  tags: string[]
}

export interface CreateReplyData {
  content: string
}

class DiscussionsService {
  /**
   * Get all discussions
   */
  async getDiscussions(filters?: {
    category?: string
    sort?: 'recent' | 'popular' | 'unanswered'
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.sort) params.append('sort', filters.sort)
    if (filters?.search) params.append('search', filters.search)

    const query = params.toString() ? `?${params.toString()}` : ''
    return apiClient.get<Discussion[]>(`/discussions${query}`)
  }

  /**
   * Get discussion by ID
   */
  async getDiscussionById(id: number) {
    return apiClient.get<Discussion>(`/discussions/${id}`)
  }

  /**
   * Create new discussion
   */
  async createDiscussion(data: CreateDiscussionData) {
    return apiClient.post<Discussion>('/discussions', data)
  }

  /**
   * Update discussion
   */
  async updateDiscussion(id: number, data: Partial<CreateDiscussionData>) {
    return apiClient.put<Discussion>(`/discussions/${id}`, data)
  }

  /**
   * Delete discussion
   */
  async deleteDiscussion(id: number) {
    return apiClient.delete(`/discussions/${id}`)
  }

  /**
   * Like discussion
   */
  async likeDiscussion(id: number) {
    return apiClient.post(`/discussions/${id}/like`)
  }

  /**
   * Unlike discussion
   */
  async unlikeDiscussion(id: number) {
    return apiClient.delete(`/discussions/${id}/like`)
  }

  /**
   * Get discussion replies
   */
  async getReplies(discussionId: number) {
    return apiClient.get<DiscussionReply[]>(`/discussions/${discussionId}/replies`)
  }

  /**
   * Create reply
   */
  async createReply(discussionId: number, data: CreateReplyData) {
    return apiClient.post<DiscussionReply>(`/discussions/${discussionId}/replies`, data)
  }

  /**
   * Update reply
   */
  async updateReply(discussionId: number, replyId: number, data: CreateReplyData) {
    return apiClient.put<DiscussionReply>(`/discussions/${discussionId}/replies/${replyId}`, data)
  }

  /**
   * Delete reply
   */
  async deleteReply(discussionId: number, replyId: number) {
    return apiClient.delete(`/discussions/${discussionId}/replies/${replyId}`)
  }

  /**
   * Like reply
   */
  async likeReply(discussionId: number, replyId: number) {
    return apiClient.post(`/discussions/${discussionId}/replies/${replyId}/like`)
  }

  /**
   * Unlike reply
   */
  async unlikeReply(discussionId: number, replyId: number) {
    return apiClient.delete(`/discussions/${discussionId}/replies/${replyId}/like`)
  }

  /**
   * Mark reply as solution
   */
  async markAsSolution(discussionId: number, replyId: number) {
    return apiClient.post(`/discussions/${discussionId}/replies/${replyId}/solution`)
  }

  /**
   * Pin discussion (Admin only)
   */
  async pinDiscussion(id: number) {
    return apiClient.post(`/discussions/${id}/pin`)
  }

  /**
   * Unpin discussion (Admin only)
   */
  async unpinDiscussion(id: number) {
    return apiClient.delete(`/discussions/${id}/pin`)
  }

  /**
   * Lock discussion (Admin only)
   */
  async lockDiscussion(id: number) {
    return apiClient.post(`/discussions/${id}/lock`)
  }

  /**
   * Unlock discussion (Admin only)
   */
  async unlockDiscussion(id: number) {
    return apiClient.delete(`/discussions/${id}/lock`)
  }
}

export const discussionsService = new DiscussionsService()
export default discussionsService

/**
 * Discussions Data Hooks
 * React hooks for fetching and managing discussion forum data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { discussionsService, type Discussion, type DiscussionReply } from '@/lib/services'

interface UseDiscussionsOptions {
  category?: string
  sort?: 'recent' | 'popular' | 'unanswered'
  search?: string
  autoFetch?: boolean
}

interface UseDiscussionsReturn {
  discussions: Discussion[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch discussions list
 */
export function useDiscussions(options: UseDiscussionsOptions = {}): UseDiscussionsReturn {
  const { category, sort, search, autoFetch = true } = options
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchDiscussions = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await discussionsService.getDiscussions({ category, sort, search })

    if (response.error) {
      setError(response.error)
      setDiscussions([])
    } else if (response.data) {
      setDiscussions(response.data)
    }

    setLoading(false)
  }, [category, sort, search])

  useEffect(() => {
    if (autoFetch) {
      fetchDiscussions()
    }
  }, [autoFetch, fetchDiscussions])

  return {
    discussions,
    loading,
    error,
    refetch: fetchDiscussions,
  }
}

interface UseDiscussionReturn {
  discussion: Discussion | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  like: () => Promise<void>
  unlike: () => Promise<void>
}

/**
 * Hook to fetch a single discussion by ID
 */
export function useDiscussion(discussionId: number): UseDiscussionReturn {
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiscussion = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await discussionsService.getDiscussionById(discussionId)

    if (response.error) {
      setError(response.error)
      setDiscussion(null)
    } else if (response.data) {
      setDiscussion(response.data)
    }

    setLoading(false)
  }, [discussionId])

  const like = useCallback(async () => {
    const response = await discussionsService.likeDiscussion(discussionId)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchDiscussion()
    }
  }, [discussionId, fetchDiscussion])

  const unlike = useCallback(async () => {
    const response = await discussionsService.unlikeDiscussion(discussionId)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchDiscussion()
    }
  }, [discussionId, fetchDiscussion])

  useEffect(() => {
    fetchDiscussion()
  }, [fetchDiscussion])

  return {
    discussion,
    loading,
    error,
    refetch: fetchDiscussion,
    like,
    unlike,
  }
}

interface UseRepliesReturn {
  replies: DiscussionReply[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createReply: (content: string) => Promise<void>
  likeReply: (replyId: number) => Promise<void>
  unlikeReply: (replyId: number) => Promise<void>
  markAsSolution: (replyId: number) => Promise<void>
}

/**
 * Hook to fetch discussion replies
 */
export function useReplies(discussionId: number): UseRepliesReturn {
  const [replies, setReplies] = useState<DiscussionReply[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReplies = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await discussionsService.getReplies(discussionId)

    if (response.error) {
      setError(response.error)
      setReplies([])
    } else if (response.data) {
      setReplies(response.data)
    }

    setLoading(false)
  }, [discussionId])

  const createReply = useCallback(async (content: string) => {
    const response = await discussionsService.createReply(discussionId, { content })
    if (response.error) {
      setError(response.error)
    } else {
      await fetchReplies()
    }
  }, [discussionId, fetchReplies])

  const likeReply = useCallback(async (replyId: number) => {
    const response = await discussionsService.likeReply(discussionId, replyId)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchReplies()
    }
  }, [discussionId, fetchReplies])

  const unlikeReply = useCallback(async (replyId: number) => {
    const response = await discussionsService.unlikeReply(discussionId, replyId)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchReplies()
    }
  }, [discussionId, fetchReplies])

  const markAsSolution = useCallback(async (replyId: number) => {
    const response = await discussionsService.markAsSolution(discussionId, replyId)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchReplies()
    }
  }, [discussionId, fetchReplies])

  useEffect(() => {
    fetchReplies()
  }, [fetchReplies])

  return {
    replies,
    loading,
    error,
    refetch: fetchReplies,
    createReply,
    likeReply,
    unlikeReply,
    markAsSolution,
  }
}

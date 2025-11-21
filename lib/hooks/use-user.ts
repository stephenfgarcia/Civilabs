/**
 * User Data Hooks
 * React hooks for fetching and managing user data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { usersService, type UserProfile, type Badge, type Achievement } from '@/lib/services'

type UpdateProfileData = Partial<UserProfile>

interface UseCurrentUserReturn {
  user: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  uploadAvatar: (file: File) => Promise<void>
}

/**
 * Hook to fetch current user profile
 */
export function useCurrentUser(): UseCurrentUserReturn {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await usersService.getCurrentUser()

    if (response.error) {
      setError(response.error)
      setUser(null)
    } else if (response.data) {
      setUser(response.data)
    }

    setLoading(false)
  }, [])

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    const response = await usersService.updateProfile(data)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchUser()
    }
  }, [fetchUser])

  const uploadAvatar = useCallback(async (file: File) => {
    const response = await usersService.uploadAvatar(file)
    if (response.error) {
      setError(response.error)
    } else {
      await fetchUser()
    }
  }, [fetchUser])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateProfile,
    uploadAvatar,
  }
}

interface UseBadgesReturn {
  badges: Badge[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch user badges
 */
export function useBadges(userId?: number): UseBadgesReturn {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBadges = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await usersService.getUserBadges(userId)

    if (response.error) {
      setError(response.error)
      setBadges([])
    } else if (response.data) {
      setBadges(response.data)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchBadges()
  }, [fetchBadges])

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
  }
}

interface UseAchievementsReturn {
  achievements: Achievement[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch user achievements
 */
export function useAchievements(userId?: number): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await usersService.getUserAchievements(userId)

    if (response.error) {
      setError(response.error)
      setAchievements([])
    } else if (response.data) {
      setAchievements(response.data)
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  }
}

interface UseLeaderboardReturn {
  leaderboard: UserProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard(filters?: {
  period?: 'week' | 'month' | 'all-time'
  department?: string
}): UseLeaderboardReturn {
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Stringify filters for stable dependency
  const filtersJson = JSON.stringify(filters)

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true)
    setError(null)

    // Parse back the filters
    const parsedFilters = filters ? JSON.parse(filtersJson) : undefined

    const response = await usersService.getLeaderboard(parsedFilters)

    if (response.error) {
      setError(response.error)
      setLeaderboard([])
    } else if (response.data) {
      setLeaderboard(response.data)
    }

    setLoading(false)
  }, [filtersJson, filters])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  }
}

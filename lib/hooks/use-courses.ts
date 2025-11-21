/**
 * Courses Data Hooks
 * React hooks for fetching and managing course data
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { coursesService, type Course, type Lesson, type CourseProgress } from '@/lib/services'

interface UseCoursesOptions {
  category?: string
  difficulty?: string
  search?: string
  autoFetch?: boolean
}

interface UseCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch courses list
 */
export function useCourses(options: UseCoursesOptions = {}): UseCoursesReturn {
  const { category, difficulty, search, autoFetch = true } = options
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await coursesService.getCourses({ category, difficulty, search })

    if (response.error) {
      setError(response.error)
      setCourses([])
    } else if (response.data) {
      setCourses(response.data)
    }

    setLoading(false)
  }, [category, difficulty, search])

  useEffect(() => {
    if (autoFetch) {
      fetchCourses()
    }
  }, [autoFetch, fetchCourses])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  }
}

interface UseCourseReturn {
  course: Course | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  enroll: () => Promise<void>
  unenroll: () => Promise<void>
}

/**
 * Hook to fetch a single course by ID
 */
export function useCourse(courseId: number): UseCourseReturn {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourse = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await coursesService.getCourseById(String(courseId))

    if (response.error) {
      setError(response.error)
      setCourse(null)
    } else if (response.data) {
      setCourse(response.data)
    }

    setLoading(false)
  }, [courseId])

  const enroll = useCallback(async () => {
    const response = await coursesService.enrollCourse(String(courseId))
    if (response.error) {
      setError(response.error)
    } else {
      await fetchCourse()
    }
  }, [courseId, fetchCourse])

  const unenroll = useCallback(async () => {
    const response = await coursesService.unenrollCourse(String(courseId))
    if (response.error) {
      setError(response.error)
    } else {
      await fetchCourse()
    }
  }, [courseId, fetchCourse])

  useEffect(() => {
    fetchCourse()
  }, [fetchCourse])

  return {
    course,
    loading,
    error,
    refetch: fetchCourse,
    enroll,
    unenroll,
  }
}

interface UseCourseProgressReturn {
  progress: CourseProgress | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  markLessonComplete: (lessonId: number) => Promise<void>
}

/**
 * Hook to fetch course progress
 */
export function useCourseProgress(courseId: number): UseCourseProgressReturn {
  const [progress, setProgress] = useState<CourseProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await coursesService.getCourseProgress(String(courseId))

    if (response.error) {
      setError(response.error)
      setProgress(null)
    } else if (response.data) {
      setProgress(response.data as CourseProgress)
    }

    setLoading(false)
  }, [courseId])

  const markLessonComplete = useCallback(async (lessonId: number) => {
    const response = await coursesService.markLessonComplete(String(lessonId))
    if (response.error) {
      setError(response.error)
    } else {
      await fetchProgress()
    }
  }, [courseId, fetchProgress])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    refetch: fetchProgress,
    markLessonComplete,
  }
}

interface UseLessonReturn {
  lesson: Lesson | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch a lesson
 */
export function useLesson(courseId: number, lessonId: number): UseLessonReturn {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLesson = useCallback(async () => {
    setLoading(true)
    setError(null)

    const response = await coursesService.getLesson(String(lessonId))

    if (response.error) {
      setError(response.error)
      setLesson(null)
    } else if (response.data) {
      setLesson(response.data as Lesson)
    }

    setLoading(false)
  }, [courseId, lessonId])

  useEffect(() => {
    fetchLesson()
  }, [fetchLesson])

  return {
    lesson,
    loading,
    error,
    refetch: fetchLesson,
  }
}

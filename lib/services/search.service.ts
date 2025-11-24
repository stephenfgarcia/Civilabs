/**
 * Search API Service
 * Handles global search across courses, lessons, instructors, and certificates
 */

import { apiClient } from './api-client'

export interface SearchResult {
  id: string
  type: 'course' | 'lesson' | 'instructor' | 'certificate'
  title: string
  description: string
  url: string
  metadata?: string
  thumbnail?: string | null
  avatarUrl?: string | null
  duration?: string
  students?: number
  difficultyLevel?: string | null
  category?: string
  contentType?: string | null
  role?: string
  verificationCode?: string
  issuedAt?: Date
  expiresAt?: Date | null
}

export interface SearchResponse {
  courses: SearchResult[]
  lessons: SearchResult[]
  instructors: SearchResult[]
  certificates: SearchResult[]
  total: number
}

export type SearchType = 'all' | 'course' | 'lesson' | 'instructor' | 'certificate'

class SearchService {
  /**
   * Perform global search
   * @param query - Search query string
   * @param type - Filter by result type (default: 'all')
   */
  async search(query: string, type: SearchType = 'all'): Promise<SearchResponse> {
    if (!query || query.trim().length === 0) {
      return {
        courses: [],
        lessons: [],
        instructors: [],
        certificates: [],
        total: 0,
      }
    }

    const params = new URLSearchParams()
    params.append('q', query.trim())
    if (type !== 'all') {
      params.append('type', type)
    }

    const response = await apiClient.get<SearchResponse>(`/search?${params.toString()}`)
    return response.data!
  }

  /**
   * Search courses only
   */
  async searchCourses(query: string): Promise<SearchResult[]> {
    const results = await this.search(query, 'course')
    return results.courses
  }

  /**
   * Search lessons only
   */
  async searchLessons(query: string): Promise<SearchResult[]> {
    const results = await this.search(query, 'lesson')
    return results.lessons
  }

  /**
   * Search instructors only
   */
  async searchInstructors(query: string): Promise<SearchResult[]> {
    const results = await this.search(query, 'instructor')
    return results.instructors
  }

  /**
   * Search certificates only
   */
  async searchCertificates(query: string): Promise<SearchResult[]> {
    const results = await this.search(query, 'certificate')
    return results.certificates
  }
}

export const searchService = new SearchService()
export default searchService

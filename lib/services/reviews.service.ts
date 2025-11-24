/**
 * Reviews API Service
 * Handles course reviews and ratings
 */

import { apiClient } from './api-client'

export interface Review {
  id: string
  courseId: string
  userId: string
  rating: number
  comment: string | null
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    firstName: string
    lastName: string
    avatarUrl: string | null
  }
  _count: {
    likes: number
  }
}

export interface ReviewsResponse {
  reviews: Review[]
  count: number
  total: number
  averageRating: number
  ratingDistribution: Record<number, number>
}

class ReviewsService {
  /**
   * Get reviews for a course
   */
  async getReviews(
    courseId: string,
    options?: {
      rating?: number
      limit?: number
      offset?: number
    }
  ): Promise<ReviewsResponse> {
    const params = new URLSearchParams()
    params.append('courseId', courseId)

    if (options?.rating) {
      params.append('rating', String(options.rating))
    }
    if (options?.limit) {
      params.append('limit', String(options.limit))
    }
    if (options?.offset) {
      params.append('offset', String(options.offset))
    }

    const response = await apiClient.get<ReviewsResponse>(`/reviews?${params.toString()}`)
    return response.data!
  }

  /**
   * Create or update a review
   */
  async createReview(data: {
    courseId: string
    rating: number
    comment?: string
  }): Promise<Review> {
    const response = await apiClient.post<Review>('/reviews', data)
    return response.data!
  }

  /**
   * Get average rating for a course
   */
  async getCourseRating(courseId: string): Promise<{
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
  }> {
    const response = await this.getReviews(courseId, { limit: 0 })
    return {
      averageRating: response.averageRating,
      totalReviews: response.total,
      ratingDistribution: response.ratingDistribution,
    }
  }
}

export const reviewsService = new ReviewsService()
export default reviewsService

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { reviewsService, type Review } from '@/lib/services'
import StarRating from './StarRating'
import { formatDistanceToNow } from 'date-fns'

interface ReviewsListProps {
  courseId: string
  refreshTrigger?: number
}

export default function ReviewsList({ courseId, refreshTrigger }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [ratingFilter, setRatingFilter] = useState<number | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [courseId, ratingFilter, refreshTrigger])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const data = await reviewsService.getReviews(courseId, {
        rating: ratingFilter,
        limit: 20,
      })
      setReviews(data.reviews)
      setAverageRating(data.averageRating)
      setTotalReviews(data.total)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
            <StarRating rating={averageRating} readonly size="md" />
            <div className="text-sm text-gray-500 mt-1">{totalReviews} reviews</div>
          </div>

          {/* Filter by rating */}
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700 mb-2">Filter by rating:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setRatingFilter(undefined)}
                className={`px-3 py-1 rounded-lg text-sm ${!ratingFilter ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setRatingFilter(rating)}
                  className={`px-3 py-1 rounded-lg text-sm ${ratingFilter === rating ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {rating} ★
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {ratingFilter ? 'No reviews with this rating' : 'No reviews yet'}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-yellow-500 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {review.user.avatarUrl ? (
                    <Image src={review.user.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold">
                      {review.user.firstName[0]}
                      {review.user.lastName[0]}
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {review.user.firstName} {review.user.lastName}
                        {review.isVerified && (
                          <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>

                  {review.comment && (
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

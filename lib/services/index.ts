/**
 * Services Index
 * Central export point for all API services
 */

export { apiClient, default as api } from './api-client'
export { coursesService, default as courses } from './courses.service'
export { usersService, default as users } from './users.service'
export { discussionsService, default as discussions } from './discussions.service'
export { notificationsService, default as notifications } from './notifications.service'
export { certificatesService, default as certificates } from './certificates.service'
export { adminService, default as admin } from './admin.service'
export { instructorService, default as instructor } from './instructor.service'
export { searchService, default as search } from './search.service'
export { reviewsService, default as reviews } from './reviews.service'
export { bookmarksService, default as bookmarks } from './bookmarks.service'
export { messagesService, default as messages } from './messages.service'
export { authService, default as auth } from './auth.service'
export { departmentsService, default as departments } from './departments.service'
export { mediaService, default as media } from './media.service'
export { questionsService, default as questions } from './questions.service'

// Export types
export type { Course, Lesson, Quiz, CourseProgress } from './courses.service'
export type { User, UserProfile, Badge, Achievement } from './users.service'
export type { Discussion, DiscussionReply } from './discussions.service'
export type { Notification, NotificationPreferences } from './notifications.service'
export type { Certificate } from './certificates.service'
export type { AdminStats } from './admin.service'
export type {
  InstructorStats,
  InstructorStatsResponse,
  InstructorCourse,
  Student,
  InstructorAnalytics,
  CourseMetrics,
} from './instructor.service'
export type { SearchResult, SearchResponse, SearchType } from './search.service'
export type { Review, ReviewsResponse } from './reviews.service'
export type { Bookmark } from './bookmarks.service'
export type { Message, Conversation } from './messages.service'
export type { Department } from './departments.service'
export type { Question } from './questions.service'
export type { MediaUploadResponse } from './media.service'

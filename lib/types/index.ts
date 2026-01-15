/**
 * Centralized Type Definitions
 * All shared TypeScript interfaces for the Civilabs LMS
 */

// Re-export existing service types for convenience
export type {
  Course,
  Lesson,
  Quiz,
  QuizQuestion,
  CourseProgress,
} from '../services/courses.service'

export type {
  User,
  UserProfile,
  Badge,
  Achievement,
  UpdateProfileData,
} from '../services/users.service'

export type {
  Notification,
  NotificationPreferences,
} from '../services/notifications.service'

export type { Certificate } from '../services/certificates.service'

export type { Discussion, DiscussionReply } from '../services/discussions.service'

export type { Message, Conversation } from '../services/messages.service'

export type { Department } from '../services/departments.service'

// ============================================
// Dashboard-specific types
// ============================================

/**
 * Dashboard statistics displayed on the home page
 */
export interface DashboardStats {
  enrolled: number
  inProgress: number
  completed: number
  certificates: number
  learningHours: number
  streak: number
}

/**
 * Enrollment with course details for dashboard display
 */
export interface EnrollmentWithCourse {
  id: string
  courseId: string
  userId: string
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED'
  enrolledAt: string
  completedAt?: string
  updatedAt?: string
  progressPercentage?: number
  calculatedProgress?: number
  course?: {
    id: string
    title: string
    description?: string
    difficultyLevel?: string
    duration?: string
    category?: {
      id: string
      name: string
    }
    instructor?: {
      firstName: string
      lastName: string
    }
  }
}

/**
 * Leaderboard user entry
 */
export interface LeaderboardUser {
  id: string
  rank: number
  firstName: string
  lastName: string
  avatar?: string
  department?: string
  points: number
  completedCourses: number
  certificates: number
  streak: number
  badge?: string
  isCurrentUser?: boolean
}

/**
 * Leaderboard filter options
 */
export type LeaderboardPeriod = 'all-time' | 'this-month' | 'this-week' | 'my-department'

/**
 * Certificate display status
 */
export type CertificateStatus = 'active' | 'expiring_soon' | 'expired'

/**
 * Extended certificate for display with computed fields
 */
export interface CertificateDisplay {
  id: string
  title: string
  courseName: string
  issueDate: string
  expiryDate?: string
  credentialId: string
  score?: number
  instructor: string
  status: CertificateStatus
  iconType: 'shield' | 'hardhat' | 'zap' | 'award'
  colorGradient: string
}

// ============================================
// Notification types
// ============================================

export type NotificationType = 'course' | 'certificate' | 'achievement' | 'system' | 'reminder'
export type NotificationStatus = 'unread' | 'read'

export interface NotificationDisplay {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  status: NotificationStatus
  actionUrl?: string
}

// ============================================
// Course catalog types
// ============================================

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type CourseCategory = 'Safety' | 'Equipment' | 'Technical' | 'Management' | 'Quality'

export interface CourseFilter {
  search?: string
  category?: CourseCategory | 'All'
  level?: SkillLevel | 'All Levels'
}

export interface CourseDisplay {
  id: string | number
  title: string
  description: string
  category: CourseCategory
  level: SkillLevel
  duration: string
  students: number
  rating?: number
  instructor?: string
  thumbnail?: string
  enrolled?: boolean
  progress?: number
}

// ============================================
// Settings types
// ============================================

export interface NotificationSettings {
  emailCourseUpdates: boolean
  emailCertificates: boolean
  emailReminders: boolean
  pushCourseUpdates: boolean
  pushAchievements: boolean
  pushReminders: boolean
  pushSystemAlerts: boolean
}

export interface UserSettings {
  profile: {
    firstName: string
    lastName: string
    email: string
    role: string
  }
  notifications: NotificationSettings
  appearance: {
    theme: 'construction' | 'light' | 'dark'
  }
}

// ============================================
// FAQ / Help types
// ============================================

export interface FAQ {
  question: string
  answer: string
}

export interface FAQCategory {
  id: string
  title: string
  icon: string
  faqs: FAQ[]
}

export interface ContactOption {
  id: string
  title: string
  description: string
  icon: string
  contact: string
  colorGradient: string
}

// ============================================
// Common UI types
// ============================================

export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export type ColorGradient =
  | 'from-primary to-blue-600'
  | 'from-success to-green-600'
  | 'from-warning to-orange-600'
  | 'from-danger to-red-600'
  | 'from-secondary to-purple-600'
  | 'from-pink-500 to-rose-600'
  | 'from-teal-500 to-cyan-600'
  | 'from-indigo-500 to-blue-600'

export interface StatCard {
  title: string
  value: number | string
  subtitle?: string
  icon: string
  colorGradient: ColorGradient
  borderColor: string
}

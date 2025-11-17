/**
 * Validation Schemas
 * Zod schemas for form validation across the application
 */

import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  department: z.string().min(1, 'Department is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Profile schemas
export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  phone: z.string().regex(/^[0-9\s\-\+\(\)]+$/, 'Invalid phone number').optional().or(z.literal('')),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
})

// Course schemas
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  duration: z.string().min(1, 'Duration is required'),
  instructor: z.string().min(1, 'Instructor is required'),
})

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  duration: z.string().min(1, 'Duration is required'),
  videoUrl: z.string().url('Invalid video URL').optional().or(z.literal('')),
  order: z.number().int().positive('Order must be a positive number'),
})

// Discussion schemas
export const discussionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(5, 'Maximum 5 tags allowed'),
})

export const replySchema = z.object({
  content: z.string().min(10, 'Reply must be at least 10 characters'),
})

// User management schemas (Admin)
export const createUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'instructor', 'learner']),
  department: z.string().min(1, 'Department is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export const updateUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'instructor', 'learner']).optional(),
  department: z.string().min(1, 'Department is required').optional(),
})

// Notification schemas (Admin)
export const notificationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  type: z.enum(['info', 'success', 'warning', 'error']),
  recipients: z.enum(['all', 'instructors', 'learners', 'admins']),
  scheduledDate: z.string().datetime().optional(),
})

// Settings schemas
export const notificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  courseUpdates: z.boolean(),
  discussionReplies: z.boolean(),
  achievements: z.boolean(),
  systemAnnouncements: z.boolean(),
})

// Export type inference
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type LessonInput = z.infer<typeof lessonSchema>
export type DiscussionInput = z.infer<typeof discussionSchema>
export type ReplyInput = z.infer<typeof replySchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type NotificationInput = z.infer<typeof notificationSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>

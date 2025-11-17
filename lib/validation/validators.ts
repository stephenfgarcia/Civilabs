/**
 * Form Validators
 * Utility functions for validating form data
 */

import { z } from 'zod'

export interface ValidationResult<T = any> {
  success: boolean
  data?: T
  errors?: Record<string, string>
}

/**
 * Validate data against a Zod schema
 */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const result = schema.safeParse(data)

    if (result.success) {
      return {
        success: true,
        data: result.data,
      }
    }

    // Transform Zod errors into a record
    const errors: Record<string, string> = {}
    result.error.errors.forEach((error) => {
      const path = error.path.join('.')
      errors[path] = error.message
    })

    return {
      success: false,
      errors,
    }
  } catch (error) {
    return {
      success: false,
      errors: {
        _form: 'Validation failed',
      },
    }
  }
}

/**
 * Validate a single field
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: string,
  value: unknown
): string | null {
  try {
    // Create a partial schema for the single field
    const fieldSchema = schema.shape?.[fieldName as keyof typeof schema.shape]

    if (!fieldSchema) {
      return null
    }

    fieldSchema.parse(value)
    return null
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Validation failed'
    }
    return 'Validation failed'
  }
}

/**
 * Email validator
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Password strength validator
 */
export function getPasswordStrength(password: string): {
  strength: 'weak' | 'medium' | 'strong'
  score: number
  feedback: string[]
} {
  let score = 0
  const feedback: string[] = []

  // Length check
  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  if (password.length >= 12) {
    score += 1
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters')
  }

  let strength: 'weak' | 'medium' | 'strong'
  if (score <= 2) {
    strength = 'weak'
  } else if (score <= 4) {
    strength = 'medium'
  } else {
    strength = 'strong'
  }

  return { strength, score, feedback }
}

/**
 * Phone number validator
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * URL validator
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * File size validator
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

/**
 * File type validator
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

/**
 * Image file validator
 */
export function isValidImage(file: File): {
  valid: boolean
  error?: string
} {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  const maxSizeMB = 5

  if (!isValidFileType(file, allowedTypes)) {
    return {
      valid: false,
      error: 'File must be an image (JPEG, PNG, GIF, or WebP)',
    }
  }

  if (!isValidFileSize(file, maxSizeMB)) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - in production use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/<[^>]*>/g, '')
}

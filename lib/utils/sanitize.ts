/**
 * Input sanitization utilities
 * Provides functions to sanitize user input for XSS prevention
 */

/**
 * Sanitizes a search query by:
 * - Trimming whitespace
 * - Removing potentially dangerous characters
 * - Limiting length
 */
export function sanitizeSearchQuery(input: string, maxLength: number = 200): string {
  if (!input) return ''

  // Trim whitespace
  let sanitized = input.trim()

  // Remove HTML tags and script-related characters
  sanitized = sanitized
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(input: string): string {
  if (!input) return ''

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return input.replace(/[&<>"']/g, (char) => htmlEntities[char] || char)
}

/**
 * Authentication Module Index
 * Central export point for all authentication utilities
 */

// Server-side auth helpers
export {
  generateToken,
  verifyToken,
  getCurrentUser,
  requireAuth,
  requireRole,
  requireAdmin,
  requireInstructor,
  hasPermission,
  setAuthCookie,
  clearAuthCookie,
  refreshToken,
  type TokenPayload,
} from './auth-helpers'

// API route auth helpers
export {
  extractToken,
  authenticateRequest,
  requireApiAuth,
  requireApiRole,
  requireApiAdmin,
  requireApiInstructor,
  withAuth,
  withRole,
  withAdmin,
  withInstructor,
  type AuthenticatedRequest,
} from './api-auth'

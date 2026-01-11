'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Get the appropriate dashboard redirect based on user role (client-side)
 */
function getRoleDashboard(role: string): string {
  const normalizedRole = role.toUpperCase()
  if (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN') {
    return '/admin'
  } else if (normalizedRole === 'INSTRUCTOR') {
    return '/instructor/dashboard'
  }
  return '/dashboard'
}

export function useAuth(requiredRole?: string[]) {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')

    if (!token || !userStr) {
      // Not authenticated, redirect to login
      const currentPath = window.location.pathname
      router.push(`/login?from=${encodeURIComponent(currentPath)}`)
      return
    }

    // Check role if specified
    if (requiredRole && requiredRole.length > 0) {
      try {
        const user = JSON.parse(userStr)
        if (!requiredRole.includes(user.role)) {
          // Not authorized, redirect to appropriate dashboard based on role
          router.push(getRoleDashboard(user.role))
          return
        }
      } catch (error) {
        console.error('Error parsing user data:', error)
        router.push('/login')
      }
    }
  }, [router, requiredRole])
}

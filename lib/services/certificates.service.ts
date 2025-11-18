/**
 * Certificates API Service
 * Handles all certificate-related API operations
 */

import { apiClient } from './api-client'

export interface Certificate {
  id: string
  userId: string
  courseId: string
  enrollmentId?: string
  issuedAt: Date
  course: {
    id: string
    title: string
    category: string
    instructor: {
      firstName: string
      lastName: string
    }
  }
  user?: {
    firstName: string
    lastName: string
  }
  enrollment?: {
    enrolledAt: Date
    completedAt?: Date
  }
}

class CertificatesService {
  /**
   * Get all certificates for current user
   */
  async getCertificates() {
    return apiClient.get<{ success: boolean; data: Certificate[]; count: number }>('/certificates')
  }

  /**
   * Get certificate by ID
   */
  async getCertificateById(id: string) {
    return apiClient.get<{ success: boolean; data: Certificate }>(`/certificates/${id}`)
  }

  /**
   * Download certificate as PDF
   */
  async downloadCertificate(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`/api/certificates/${id}/download`, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        error: error.message || 'Failed to download certificate',
        status: response.status,
      }
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificate-${id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    return {
      data: { success: true },
      status: 200,
    }
  }

  /**
   * Issue certificate (Admin only)
   */
  async issueCertificate(data: {
    userId: string
    courseId: string
    enrollmentId?: string
  }) {
    return apiClient.post<{ success: boolean; data: Certificate; message: string }>(
      '/certificates',
      data
    )
  }
}

export const certificatesService = new CertificatesService()
export default certificatesService

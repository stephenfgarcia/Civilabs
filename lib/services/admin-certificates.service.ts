/**
 * Admin Certificates Service
 * Handles all admin certificate management operations
 */

import { apiClient } from './api-client'

export interface AdminCertificate {
  id: string
  certificateId: string
  userId: string
  enrollmentId: string
  verificationCode: string
  issuedAt: string
  expiresAt?: string | null
  revokedAt?: string | null
  downloadCount: number
  lastDownloadedAt?: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl?: string | null
  }
  certificate: {
    id: string
    courseId: string
    templateHtml: string
    isActive: boolean
    course: {
      id: string
      title: string
      slug: string
      thumbnail?: string | null
      category?: {
        id: string
        name: string
      } | null
      instructor: {
        id: string
        firstName: string
        lastName: string
      }
    }
  }
  enrollment: {
    id: string
    enrolledAt: string
    completedAt?: string | null
    progressPercentage: number
  }
}

export interface IssueCertificateData {
  userId: string
  courseId: string
  enrollmentId?: string
}

export interface RevokeCertificateData {
  reason?: string
}

export interface CertificatesListResponse {
  success: boolean
  data: AdminCertificate[]
  count: number
}

export interface CertificateResponse {
  success: boolean
  data: AdminCertificate
  message?: string
}

class AdminCertificatesService {
  /**
   * Get all certificates with filtering
   */
  async getCertificates(params?: {
    userId?: string
    courseId?: string
    status?: 'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'
    search?: string
  }) {
    try {
      const queryParams = new URLSearchParams()
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.courseId) queryParams.append('courseId', params.courseId)
      if (params?.status) queryParams.append('status', params.status)

      const response = await apiClient.get<CertificatesListResponse>(
        `/certificates?${queryParams.toString()}`
      )

      // Client-side search filtering if needed
      if (response.success && params?.search) {
        const searchLower = params.search.toLowerCase()
        response.data = response.data.filter(cert =>
          cert.user.firstName.toLowerCase().includes(searchLower) ||
          cert.user.lastName.toLowerCase().includes(searchLower) ||
          cert.user.email.toLowerCase().includes(searchLower) ||
          cert.certificate.course.title.toLowerCase().includes(searchLower) ||
          cert.verificationCode.toLowerCase().includes(searchLower)
        )
        response.count = response.data.length
      }

      return response
    } catch (error) {
      console.error('Error fetching certificates:', error)
      return {
        success: false,
        data: [],
        count: 0,
        error: error instanceof Error ? error.message : 'Failed to fetch certificates',
      }
    }
  }

  /**
   * Get certificate by ID
   */
  async getCertificate(id: string) {
    try {
      const response = await apiClient.get<CertificateResponse>(`/certificates/${id}`)
      return response
    } catch (error) {
      console.error('Error fetching certificate:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch certificate',
      }
    }
  }

  /**
   * Issue certificate (admin only)
   */
  async issueCertificate(data: IssueCertificateData) {
    try {
      const response = await apiClient.post<CertificateResponse>('/certificates', data)
      return response
    } catch (error) {
      console.error('Error issuing certificate:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to issue certificate',
      }
    }
  }

  /**
   * Revoke certificate (admin only)
   */
  async revokeCertificate(id: string, data?: RevokeCertificateData) {
    try {
      const response = await apiClient.put<CertificateResponse>(
        `/certificates/${id}/revoke`,
        data || {}
      )
      return response
    } catch (error) {
      console.error('Error revoking certificate:', error)
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to revoke certificate',
      }
    }
  }

  /**
   * Delete certificate (admin only)
   */
  async deleteCertificate(id: string) {
    try {
      const response = await apiClient.delete(`/certificates/${id}`)
      return response
    } catch (error) {
      console.error('Error deleting certificate:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete certificate',
      }
    }
  }

  /**
   * Download certificate
   */
  async downloadCertificate(id: string) {
    try {
      // Note: This should trigger a file download
      const response = await apiClient.get(`/certificates/${id}/download`)
      return response
    } catch (error) {
      console.error('Error downloading certificate:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download certificate',
      }
    }
  }

  /**
   * Get certificate statistics
   */
  async getCertificateStats() {
    try {
      const response = await this.getCertificates({ status: 'ALL' })
      if (!response.success) {
        return {
          total: 0,
          active: 0,
          expired: 0,
          revoked: 0,
        }
      }

      const now = new Date()
      const stats = {
        total: response.data.length,
        active: response.data.filter(c =>
          !c.revokedAt && (!c.expiresAt || new Date(c.expiresAt) >= now)
        ).length,
        expired: response.data.filter(c =>
          !c.revokedAt && c.expiresAt && new Date(c.expiresAt) < now
        ).length,
        revoked: response.data.filter(c => c.revokedAt).length,
      }

      return stats
    } catch (error) {
      console.error('Error fetching certificate stats:', error)
      return {
        total: 0,
        active: 0,
        expired: 0,
        revoked: 0,
      }
    }
  }

  /**
   * Get certificate number (formatted)
   */
  getCertificateNumber(cert: AdminCertificate): string {
    return `CERT-${new Date(cert.issuedAt).getFullYear()}-${cert.id.substring(0, 8).toUpperCase()}`
  }

  /**
   * Get certificate status
   */
  getCertificateStatus(cert: AdminCertificate): 'ACTIVE' | 'EXPIRED' | 'REVOKED' {
    if (cert.revokedAt) return 'REVOKED'
    if (cert.expiresAt && new Date(cert.expiresAt) < new Date()) return 'EXPIRED'
    return 'ACTIVE'
  }
}

export const adminCertificatesService = new AdminCertificatesService()
export default adminCertificatesService

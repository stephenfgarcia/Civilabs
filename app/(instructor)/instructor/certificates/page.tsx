'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { apiClient } from '@/lib/services'

interface Certificate {
  id: string
  verificationCode: string
  issuedAt: string
  expiresAt: string | null
  revokedAt: string | null
  student: {
    id: string
    name: string
    email: string
    avatarUrl: string | null
  }
  course: {
    id: string
    title: string
    thumbnail: string | null
  }
  enrollment: {
    id: string
    enrolledAt: string
    completedAt: string | null
    progressPercentage: number
  }
}

interface Stats {
  total: number
  active: number
  expired: number
  revoked: number
  uniqueStudents: number
}

export default function InstructorCertificatesPage() {
  useAuth(['INSTRUCTOR'])
  const router = useRouter()

  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    expired: 0,
    revoked: 0,
    uniqueStudents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchCertificates()
  }, [statusFilter, searchTerm])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)

      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await apiClient.get(`/instructor/certificates${query}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setCertificates(apiData.data?.certificates || [])
        setStats(
          apiData.data?.stats || {
            total: 0,
            active: 0,
            expired: 0,
            revoked: 0,
            uniqueStudents: 0,
          }
        )
      } else {
        throw new Error(response.error || 'Failed to fetch certificates')
      }
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getStatusBadge = (cert: Certificate) => {
    if (cert.revokedAt) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Revoked
        </span>
      )
    }

    if (!cert.expiresAt) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      )
    }

    if (new Date(cert.expiresAt) > new Date()) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Active
        </span>
      )
    }

    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
        Expired
      </span>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Error Loading Certificates</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <button
              onClick={fetchCertificates}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Certificates</h1>
        <p className="text-neutral-600 mt-1">
          View certificates issued to students in your courses
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Certificates</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏆</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Active</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.active}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Expired</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.expired}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Revoked</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.revoked}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Students</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">
                {stats.uniqueStudents}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">
            Loading certificates...
          </div>
        ) : certificates.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">
            No certificates found. Certificates are issued when students complete
            your courses.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Issued Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Expires At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Verification Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {cert.student.avatarUrl ? (
                          <img
                            src={cert.student.avatarUrl}
                            alt={cert.student.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-neutral-600">
                              {cert.student.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {cert.student.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            {cert.student.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {cert.course.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(cert)}</td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {formatDate(cert.issuedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-900">
                      {formatDate(cert.expiresAt)}
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                        {cert.verificationCode}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              `/api/certificates/${cert.id}/download`,
                              '_blank'
                            )
                          }
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => router.push(`/certificates/${cert.id}`)}
                          className="text-green-600 hover:text-green-900 text-sm"
                        >
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

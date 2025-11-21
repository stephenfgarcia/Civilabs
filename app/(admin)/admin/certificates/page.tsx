'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  Award,
  Search,
  Filter,
  Download,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Trash2,
  Eye,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import adminCertificatesService, { AdminCertificate } from '@/lib/services/admin-certificates.service'

const MOCK_CERTIFICATES_OLD: any[] = [
  {
    id: 1,
    certificateNumber: 'CERT-2024-001',
    userId: 1,
    userName: 'John Doe',
    userEmail: 'john.doe@civilabs.com',
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    issueDate: '2024-02-20',
    expiryDate: '2027-02-20',
    status: 'active',
    grade: 95,
    verificationCode: 'VER-ABC123XYZ',
    downloadCount: 5,
    lastDownloaded: '1 week ago',
  },
  {
    id: 2,
    certificateNumber: 'CERT-2024-002',
    userId: 3,
    userName: 'Mike Chen',
    userEmail: 'mike.chen@civilabs.com',
    courseId: 2,
    courseTitle: 'Heavy Equipment Operation',
    issueDate: '2024-03-01',
    expiryDate: '2027-03-01',
    status: 'active',
    grade: 88,
    verificationCode: 'VER-DEF456UVW',
    downloadCount: 2,
    lastDownloaded: '3 days ago',
  },
  {
    id: 3,
    certificateNumber: 'CERT-2023-045',
    userId: 2,
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@civilabs.com',
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    issueDate: '2023-12-15',
    expiryDate: '2024-12-15',
    status: 'expired',
    grade: 92,
    verificationCode: 'VER-GHI789RST',
    downloadCount: 8,
    lastDownloaded: '2 months ago',
  },
  {
    id: 4,
    certificateNumber: 'CERT-2024-003',
    userId: 3,
    userName: 'Mike Chen',
    userEmail: 'mike.chen@civilabs.com',
    courseId: 3,
    courseTitle: 'Advanced Welding Techniques',
    issueDate: '2024-01-10',
    status: 'active',
    grade: 91,
    verificationCode: 'VER-JKL012MNO',
    downloadCount: 3,
    lastDownloaded: '5 days ago',
  },
]

const STATUSES = ['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const
type StatusType = typeof STATUSES[number]

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<AdminCertificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<AdminCertificate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch certificates
  useEffect(() => {
    async function fetchCertificates() {
      try {
        setLoading(true)
        setError(null)
        const response = await adminCertificatesService.getCertificates({ status: 'ALL' })

        if (response.success && response.data) {
          setCertificates(response.data)
          setFilteredCertificates(response.data)
        } else {
          setError(response.error || 'Failed to load certificates')
        }
      } catch (err) {
        setError('An error occurred while loading certificates')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = certificates

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cert =>
        `${cert.user.firstName} ${cert.user.lastName}`.toLowerCase().includes(query) ||
        cert.user.email.toLowerCase().includes(query) ||
        cert.certificate.course.title.toLowerCase().includes(query) ||
        cert.verificationCode.toLowerCase().includes(query) ||
        adminCertificatesService.getCertificateNumber(cert).toLowerCase().includes(query)
      )
    }

    // Status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(cert =>
        adminCertificatesService.getCertificateStatus(cert) === selectedStatus
      )
    }

    setFilteredCertificates(filtered)
  }, [certificates, searchQuery, selectedStatus])

  // Animations
  useEffect(() => {
    const elements = document.querySelectorAll('.admin-certs-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [loading])

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return

    try {
      const response = await adminCertificatesService.deleteCertificate(id)
      if (response.success) {
        setCertificates(prev => prev.filter(c => c.id !== id))
      } else {
        alert(response.error || 'Failed to delete certificate')
      }
    } catch (error) {
      alert('An error occurred while deleting the certificate')
      console.error(error)
    }
  }

  const getStatusColor = (status: 'ACTIVE' | 'EXPIRED' | 'REVOKED') => {
    switch (status) {
      case 'ACTIVE':
        return 'from-success to-green-600'
      case 'EXPIRED':
        return 'from-warning to-orange-600'
      case 'REVOKED':
        return 'from-danger to-red-600'
      default:
        return 'from-neutral-400 to-neutral-600'
    }
  }

  const getStatusIcon = (status: 'ACTIVE' | 'EXPIRED' | 'REVOKED') => {
    switch (status) {
      case 'ACTIVE':
        return CheckCircle
      case 'EXPIRED':
        return Clock
      case 'REVOKED':
        return XCircle
      default:
        return AlertCircle
    }
  }

  const isExpiringSoon = (expiresAt?: string | null) => {
    if (!expiresAt) return false
    const expiry = new Date(expiresAt)
    const today = new Date()
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const formatRelativeTime = (date?: string | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return '1 day ago'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-certs-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-yellow-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-yellow-600/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-yellow-600/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-yellow-600/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-yellow-600/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-500 via-orange-500 to-orange-600 bg-clip-text text-transparent mb-2">
                  CERTIFICATE MANAGEMENT
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Issue, verify, and manage certificates
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-black">
                <Award className="mr-2" size={20} />
                ISSUE CERTIFICATE
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : certificates.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL CERTIFICATES</p>
          </CardContent>
        </Card>

        <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : certificates.filter(c => adminCertificatesService.getCertificateStatus(c) === 'ACTIVE').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE</p>
          </CardContent>
        </Card>

        <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : certificates.filter(c => adminCertificatesService.getCertificateStatus(c) === 'EXPIRED').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">EXPIRED</p>
          </CardContent>
        </Card>

        <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {loading ? '...' : certificates.filter(c => adminCertificatesService.getCertificateStatus(c) === 'REVOKED').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">REVOKED</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search by user, course, or certificate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          <div>
            <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card className="admin-certs-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            CERTIFICATES ({filteredCertificates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-warning" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-danger font-bold">{error}</p>
            </div>
          ) : filteredCertificates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-600 font-bold">No certificates found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCertificates.map((cert) => {
                const status = adminCertificatesService.getCertificateStatus(cert)
                const StatusIcon = getStatusIcon(status)
                const expiringSoon = isExpiringSoon(cert.expiresAt)
                const certificateNumber = adminCertificatesService.getCertificateNumber(cert)
                const userName = `${cert.user.firstName} ${cert.user.lastName}`
                const courseTitle = cert.certificate.course.title
                const grade = cert.enrollment.progressPercentage

                return (
                <div
                  key={cert.id}
                  className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-warning/30"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getStatusColor(status)} text-white font-black text-xs uppercase flex items-center gap-1`}>
                            <StatusIcon size={12} />
                            {status}
                          </span>
                          {expiringSoon && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-warning to-orange-600 text-white font-black text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              EXPIRES SOON
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-black text-neutral-800 mb-1">
                          {certificateNumber}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                          <BookOpen size={14} />
                          <span className="font-bold">{courseTitle}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <User size={14} />
                          <span className="font-bold">{userName}</span>
                          <span>•</span>
                          <span>{cert.user.email}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                          {grade}%
                        </div>
                        <p className="text-xs text-neutral-600 font-bold">PROGRESS</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-y-2 border-neutral-200">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                          <Calendar size={12} />
                          <span>ISSUED</span>
                        </div>
                        <p className="font-bold text-neutral-800 text-sm">
                          {new Date(cert.issuedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {cert.expiresAt && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                            <Clock size={12} />
                            <span>EXPIRES</span>
                          </div>
                          <p className={`font-bold text-sm ${expiringSoon ? 'text-warning' : 'text-neutral-800'}`}>
                            {new Date(cert.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                          <Download size={12} />
                          <span>DOWNLOADS</span>
                        </div>
                        <p className="font-bold text-neutral-800 text-sm">
                          {cert.downloadCount} times
                        </p>
                      </div>

                      {cert.lastDownloadedAt && (
                        <div>
                          <div className="flex items-center gap-1 text-xs text-neutral-600 mb-1">
                            <Clock size={12} />
                            <span>LAST DOWNLOAD</span>
                          </div>
                          <p className="font-bold text-neutral-800 text-sm">
                            {formatRelativeTime(cert.lastDownloadedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Verification Code */}
                    <div className="bg-neutral-100 rounded-lg p-3">
                      <p className="text-xs font-bold text-neutral-600 mb-1">VERIFICATION CODE</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-black text-neutral-800 font-mono">
                          {cert.verificationCode}
                        </code>
                        <button className="text-primary hover:text-primary/70 transition-colors">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      <MagneticButton className="flex-1 glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60">
                        <Eye className="mr-2" size={16} />
                        VIEW
                      </MagneticButton>
                      <MagneticButton className="flex-1 glass-effect border-2 border-success/30 text-neutral-700 font-black hover:border-success/60">
                        <Download className="mr-2" size={16} />
                        DOWNLOAD
                      </MagneticButton>
                      <MagneticButton className="flex-1 glass-effect border-2 border-warning/30 text-neutral-700 font-black hover:border-warning/60">
                        <Send className="mr-2" size={16} />
                        RESEND
                      </MagneticButton>
                      <button
                        onClick={() => handleDelete(cert.id)}
                        className="w-12 h-12 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

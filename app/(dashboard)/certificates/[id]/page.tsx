'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  ArrowLeft,
  Download,
  Share2,
  Award,
  Calendar,
  User,
  CheckCircle,
  Star,
  Shield,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/services'

interface Certificate {
  id: string
  userId: string
  certificateId: string
  verificationCode: string
  issuedAt: string
  expiresAt: string | null
  certificate: {
    id: string
    courseId: string
    templateHtml: string
    isActive: boolean
    course: {
      id: string
      title: string
      description: string | null
      durationMinutes: number
      category: {
        id: string
        name: string
      } | null
      instructor: {
        firstName: string
        lastName: string
        email: string
      }
    }
  }
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  enrollment: {
    enrolledAt: string
    completedAt: string | null
  } | null
}

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const certId = params.id as string

  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCertificate()
  }, [certId])

  useEffect(() => {
    if (!certificate) return

    const elements = document.querySelectorAll('.cert-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [certificate])

  const fetchCertificate = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`/certificates/${certId}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setCertificate(apiData.data)
      } else {
        setError(response.error || 'Failed to fetch certificate')
      }
    } catch (err) {
      console.error('Error fetching certificate:', err)
      setError(err instanceof Error ? err.message : 'Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    window.open(`/api/certificates/${certId}/download`, '_blank')
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/certificates/${certId}`
    const shareText = `I earned a certificate for "${certificate?.certificate.course.title}" from Civilabs LMS!`

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Certificate Achievement',
          text: shareText,
          url: shareUrl
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Certificate link copied to clipboard! You can now share it.')
      }
    } catch (error) {
      console.error('Error sharing certificate:', error)
      if (error instanceof Error && error.name !== 'AbortError') {
        alert('Failed to share certificate. Please try again.')
      }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading certificate...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !certificate) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-danger" size={48} />
          <h2 className="text-2xl font-black text-neutral-800 mb-4">CERTIFICATE NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">
            {error || "The certificate you're looking for doesn't exist."}
          </p>
          <Link href="/certificates">
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO CERTIFICATES
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const courseTitle = certificate.certificate.course.title
  const categoryName = certificate.certificate.course.category?.name || 'General'
  const instructorName = `${certificate.certificate.course.instructor.firstName} ${certificate.certificate.course.instructor.lastName}`
  const courseDurationHours = Math.ceil(certificate.certificate.course.durationMinutes / 60)
  const isActive = !certificate.expiresAt || new Date(certificate.expiresAt) > new Date()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="cert-item opacity-0">
        <button
          onClick={() => router.push('/certificates')}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO CERTIFICATES
        </button>
      </div>

      {/* Actions */}
      <div className="cert-item opacity-0 flex items-center gap-4 flex-wrap">
        <MagneticButton
          onClick={handleDownload}
          className="bg-gradient-to-r from-success to-green-600 text-white font-black"
        >
          <Download className="mr-2" size={20} />
          DOWNLOAD PDF
        </MagneticButton>
        <MagneticButton
          onClick={handleShare}
          className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
        >
          <Share2 className="mr-2" size={20} />
          SHARE CERTIFICATE
        </MagneticButton>
      </div>

      {/* Certificate Preview */}
      <div className="cert-item opacity-0">
        <Card className="glass-effect concrete-texture border-4 border-success/40 relative overflow-hidden">
          {/* Decorative Corner Markers */}
          <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-success/60"></div>
          <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-success/60"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-success/60"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-success/60"></div>

          {/* Certificate Content */}
          <CardContent className="p-12 md:p-16 text-center relative z-10">
            {/* Institution */}
            <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-2">
              Civilabs Construction Academy
            </p>

            {/* Certificate Title */}
            <h1 className="text-2xl md:text-3xl font-black text-neutral-800 uppercase mb-4">
              CERTIFICATE OF COMPLETION
            </h1>

            {/* Award Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Award className="text-white" size={48} />
            </div>

            {/* Recipient */}
            <p className="text-sm font-bold text-neutral-600 uppercase mb-2">This certifies that</p>
            <h2 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-success via-primary to-warning bg-clip-text text-transparent mb-6">
              {certificate.user.firstName} {certificate.user.lastName}
            </h2>

            {/* Course Info */}
            <p className="text-sm font-bold text-neutral-600 uppercase mb-2">Has successfully completed</p>
            <h3 className="text-2xl md:text-3xl font-black text-neutral-800 mb-4">
              {courseTitle}
            </h3>

            {/* Description */}
            {certificate.certificate.course.description && (
              <p className="text-neutral-600 font-medium max-w-2xl mx-auto mb-8">
                {certificate.certificate.course.description}
              </p>
            )}

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-3xl mx-auto">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Issue Date</p>
                <p className="text-sm font-semibold text-neutral-800 flex items-center justify-center gap-2">
                  <Calendar size={16} className="text-success" />
                  {new Date(certificate.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {certificate.expiresAt && (
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Expiry Date</p>
                  <p className="text-sm font-semibold text-neutral-800 flex items-center justify-center gap-2">
                    <Calendar size={16} className="text-primary" />
                    {new Date(certificate.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Instructor</p>
                <p className="text-sm font-semibold text-neutral-800 flex items-center justify-center gap-2">
                  <User size={16} className="text-secondary" />
                  {instructorName}
                </p>
              </div>
            </div>

            {/* Verification */}
            <div className="mt-8 pt-8 border-t-2 border-neutral-200">
              <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Verification Code</p>
              <p className="text-sm font-mono font-semibold text-neutral-800">
                {certificate.verificationCode || certificate.id}
              </p>
            </div>

            {/* Status Badge */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {isActive ? (
                <>
                  <CheckCircle className="text-success" size={20} />
                  <span className="text-sm font-bold text-success uppercase">VERIFIED & ACTIVE</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-warning" size={20} />
                  <span className="text-sm font-bold text-warning uppercase">EXPIRED</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      <div className="cert-item opacity-0 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Course Information */}
        <Card className="glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-neutral-800 mb-4 flex items-center gap-2">
              <Shield className="text-primary" size={24} />
              Course Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Category</p>
                <p className="text-sm font-semibold text-neutral-800">{categoryName}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Duration</p>
                <p className="text-sm font-semibold text-neutral-800">{courseDurationHours} {courseDurationHours === 1 ? 'hour' : 'hours'}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Completion Date</p>
                <p className="text-sm font-semibold text-neutral-800">
                  {certificate.enrollment?.completedAt
                    ? new Date(certificate.enrollment.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Not available'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Status</p>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <>
                      <CheckCircle className="text-success" size={16} />
                      <span className="text-sm font-bold text-success">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="text-warning" size={16} />
                      <span className="text-sm font-bold text-warning">Expired</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Info */}
        <Card className="glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6">
            <h3 className="text-xl font-black text-neutral-800 mb-4 flex items-center gap-2">
              <Star className="text-secondary" size={24} />
              Verification Details
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Certificate ID</p>
                <p className="text-sm font-mono font-semibold text-neutral-800 break-all">{certificate.id}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Verification Code</p>
                <p className="text-sm font-mono font-semibold text-neutral-800 break-all">
                  {certificate.verificationCode || certificate.id}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Issued To</p>
                <p className="text-sm font-semibold text-neutral-800">{certificate.user.email}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase">Institution</p>
                <p className="text-sm font-semibold text-neutral-800">Civilabs Construction Academy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Award, Download, Share2, Calendar, CheckCircle, Shield, HardHat, Eye, ExternalLink, BookOpen, Wrench } from 'lucide-react'
import { certificatesService } from '@/lib/services'
import { useToast, useEntranceAnimation } from '@/lib/hooks'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/page-states'
import type { Certificate } from '@/lib/types'
import type { User as UserType } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

// Icon mapping for certificate categories with proper typing
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Safety: Shield,
  Equipment: Wrench,
  Technical: BookOpen,
  Management: HardHat,
  Quality: Award,
  Construction: HardHat,
  Engineering: BookOpen,
}

// Color mapping for certificate categories
const CATEGORY_COLORS: Record<string, string> = {
  Safety: 'from-danger to-red-600',
  Equipment: 'from-warning to-orange-600',
  Technical: 'from-primary to-blue-600',
  Management: 'from-success to-green-600',
  Quality: 'from-secondary to-purple-600',
  Construction: 'from-warning to-orange-600',
  Engineering: 'from-primary to-blue-600',
}


// Extended certificate type for API response
interface CertificateResponse {
  id: string
  title?: string
  issuedAt: string
  expiresAt?: string
  verificationCode?: string
  certificate?: {
    course?: {
      title?: string
      category?: {
        name: string
      }
    }
  }
  course?: {
    title?: string
  }
}

export default function CertificatesPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<UserType | null>(null)
  const [certificates, setCertificates] = useState<CertificateResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateResponse | null>(null)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.certificates-item', staggerDelay: 0.05 }, [loading, certificates.length])

  useEffect(() => {
    // Load user from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await certificatesService.getCertificates()
      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.error || 'Failed to fetch certificates')
      }

      const certificatesData = (response.data as any)?.data || []
      setCertificates(certificatesData)
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (certificate: CertificateResponse) => {
    try {
      // Open the certificate download URL in a new window
      window.open(`/api/certificates/${certificate.id}/download`, '_blank')
      toast({
        title: 'Download Started',
        description: 'Your certificate download has been initiated.',
      })
    } catch (err) {
      console.error('Error downloading certificate:', err)
      toast({
        title: 'Error',
        description: 'Failed to download certificate. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleShare = async (certificate: CertificateResponse) => {
    try {
      const shareUrl = `${window.location.origin}/certificates/${certificate.id}`
      const shareText = `I earned a certificate for "${certificate.certificate?.course?.title || certificate.course?.title || 'this course'}" from Civilabs LMS!`

      // Try to use native Web Share API (mobile/modern browsers)
      if (navigator.share) {
        await navigator.share({
          title: 'Certificate Achievement',
          text: shareText,
          url: shareUrl,
        })
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: 'Link Copied',
          description: 'Certificate link copied to clipboard! You can now share it.',
        })
      }
    } catch (err) {
      console.error('Error sharing certificate:', err)
      // Only show error if it's not a user cancellation
      if (err instanceof Error && err.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: 'Failed to share certificate. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }

  const handleView = (certificate: CertificateResponse) => {
    setSelectedCertificate(certificate)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success">ACTIVE</span>
      case 'expiring_soon':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">EXPIRING SOON</span>
      case 'expired':
        return <span className="text-xs font-bold px-3 py-1 rounded-full bg-danger/20 text-danger">EXPIRED</span>
      default:
        return null
    }
  }

  // Loading state
  if (loading) {
    return <LoadingState message="Loading your certificates..." size="lg" />
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Error Loading Certificates"
        message={error}
        onRetry={fetchCertificates}
      />
    )
  }

  return (
    <div className="space-y-6" role="main" aria-label="Certificates">
      {/* Page Header */}
      <div className="certificates-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-success via-warning to-primary bg-clip-text text-transparent">
              MY CERTIFICATES
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              View and download your earned certifications
            </p>
          </div>
          <div className="hidden md:block" aria-hidden="true">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <section className="certificates-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4" aria-label="Certificate statistics">
        <Card className="glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-total-label">Total Earned</p>
                <p className="text-4xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-total-label">
                  {certificates.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Award className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-active-label">Active</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-active-label">
                  {certificates.filter(c => !c.expiresAt || new Date(c.expiresAt) > new Date()).length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600" aria-hidden="true" />
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase" id="stat-recent-label">Recent</p>
                <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mt-1" aria-labelledby="stat-recent-label">
                  {certificates.filter(c => {
                    const issuedDate = new Date(c.issuedAt)
                    const thirtyDaysAgo = new Date()
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                    return issuedDate > thirtyDaysAgo
                  }).length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Calendar className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Certificates List */}
      {certificates.length > 0 ? (
        <div className="space-y-4" role="list" aria-label="Earned certificates">
          {certificates.map((certificate) => {
            const categoryName = certificate.certificate?.course?.category?.name || 'General'
            const IconComponent = CATEGORY_ICONS[categoryName] || Award
            const color = CATEGORY_COLORS[categoryName] || 'from-success to-green-600'
            const certTitle = certificate.certificate?.course?.title || 'Certificate'

            return (
              <article
                key={certificate.id}
                className="certificates-item opacity-0 glass-effect concrete-texture border-4 border-success/20 hover:border-success/40 transition-all group relative overflow-hidden rounded-lg"
                role="listitem"
                aria-label={`Certificate: ${certTitle}`}
              >
                {/* Accent Bar */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${color}`} aria-hidden="true" />

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Certificate Info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="text-white" size={40} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-black text-neutral-800 group-hover:text-success transition-colors">
                                {certificate.certificate?.course?.title || 'Certificate'}
                              </h3>
                              <p className="text-sm text-neutral-600 mt-1">{categoryName} Certification</p>
                            </div>
                            {getStatusBadge(!certificate.expiresAt || new Date(certificate.expiresAt) > new Date() ? 'active' : 'expired')}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs font-bold text-neutral-500 uppercase">Issue Date</p>
                              <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                <Calendar size={14} className="text-success" />
                                {new Date(certificate.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            {certificate.expiresAt && (
                              <div>
                                <p className="text-xs font-bold text-neutral-500 uppercase">Expiry Date</p>
                                <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                  <Calendar size={14} className="text-primary" />
                                  {new Date(certificate.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-neutral-500 uppercase">Status</p>
                              <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                <CheckCircle size={14} className="text-success" />
                                Verified
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 glass-effect border-2 border-neutral-200 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-bold text-neutral-600">Certificate ID: </span>
                                <span className="font-mono text-neutral-800">{certificate.id}</span>
                              </div>
                              <div>
                                <span className="font-bold text-neutral-600">Course: </span>
                                <span className="text-neutral-800">{certificate.course?.title || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-5">
                      <div className="flex flex-col gap-3" role="group" aria-label="Certificate actions">
                        <Link href={`/certificates/${certificate.id}`} className="w-full">
                          <MagneticButton
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center justify-center gap-2"
                            aria-label={`View certificate: ${certTitle}`}
                          >
                            <Eye size={18} aria-hidden="true" />
                            VIEW CERTIFICATE
                          </MagneticButton>
                        </Link>

                        <MagneticButton
                          onClick={() => handleDownload(certificate)}
                          className="w-full bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center justify-center gap-2"
                          aria-label={`Download PDF for ${certTitle}`}
                        >
                          <Download size={18} aria-hidden="true" />
                          DOWNLOAD PDF
                        </MagneticButton>

                        <MagneticButton
                          onClick={() => handleShare(certificate)}
                          className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center justify-center gap-2"
                          aria-label={`Share certificate: ${certTitle}`}
                        >
                          <Share2 size={18} aria-hidden="true" />
                          SHARE
                        </MagneticButton>

                        <button
                          onClick={() => {
                            const verifyUrl = `${window.location.origin}/verify/${certificate.verificationCode}`
                            window.open(verifyUrl, '_blank')
                          }}
                          className="w-full glass-effect border-2 border-secondary/30 hover:border-secondary/60 rounded-lg py-3 font-bold text-sm text-secondary flex items-center justify-center gap-2 transition-all hover:scale-105"
                          aria-label={`Verify credential for ${certTitle}`}
                        >
                          <ExternalLink size={16} aria-hidden="true" />
                          Verify Credential
                        </button>
                      </div>

                      {/* Certificate Preview Card */}
                      <div className="mt-4 glass-effect border-4 border-success/20 rounded-lg p-4 bg-gradient-to-br from-success/5 to-warning/5" aria-hidden="true">
                        <div className="text-center">
                          <Award className="mx-auto text-success mb-2" size={32} />
                          <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Certificate of Completion</p>
                          <p className="text-sm font-black text-neutral-800">{certificate.title}</p>
                          <div className="mt-3 pt-3 border-t-2 border-neutral-200">
                            <p className="text-xs text-neutral-500">Awarded to</p>
                            <p className="text-sm font-bold text-neutral-800 mt-1">
                              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Award className="text-neutral-400" size={48} />}
          title="No certificates earned yet"
          description="Complete courses to earn certificates"
          action={{
            label: 'BROWSE COURSES',
            href: '/courses'
          }}
        />
      )}

      {/* Certificate Modal/Viewer (Simple placeholder) */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCertificate(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <Card
            className="max-w-2xl w-full glass-effect concrete-texture border-4 border-success/40"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle id="modal-title" className="text-2xl font-black">Certificate Preview</CardTitle>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="w-10 h-10 bg-danger/20 hover:bg-danger/30 rounded-lg flex items-center justify-center transition-colors"
                  aria-label="Close certificate preview"
                >
                  <span className="text-danger font-black text-xl" aria-hidden="true">×</span>
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-success/10 via-warning/10 to-primary/10 border-4 border-success/20 rounded-xl p-8 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={40} />
                </div>
                <h2 className="text-3xl font-black text-neutral-800 mb-2">CERTIFICATE OF COMPLETION</h2>
                <p className="text-sm text-neutral-600 mb-6">This certifies that</p>
                <p className="text-2xl font-black text-neutral-800 mb-6">YOUR NAME</p>
                <p className="text-sm text-neutral-600 mb-2">has successfully completed</p>
                <p className="text-xl font-black text-neutral-800 mb-6">{selectedCertificate.title}</p>
                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t-2 border-neutral-200">
                  <div>
                    <p className="text-xs font-bold text-neutral-500">Issue Date</p>
                    <p className="text-sm font-semibold text-neutral-800">{new Date(selectedCertificate.issuedAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500">Credential ID</p>
                    <p className="text-sm font-mono font-semibold text-neutral-800">{selectedCertificate.id}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <MagneticButton
                  onClick={() => handleDownload(selectedCertificate)}
                  className="flex-1 bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  DOWNLOAD
                </MagneticButton>
                <MagneticButton
                  onClick={() => handleShare(selectedCertificate)}
                  className="flex-1 bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  SHARE
                </MagneticButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

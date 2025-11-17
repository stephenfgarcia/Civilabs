'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Award, Download, Share2, Calendar, CheckCircle, Shield, HardHat, Zap, Eye, ExternalLink } from 'lucide-react'

// Mock certificates data - matches dashboard stats (3 certificates earned from 5 completed courses)
const MOCK_CERTIFICATES = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    courseName: 'Safety Training Level 1',
    issueDate: '2024-01-15',
    expiryDate: '2026-01-15',
    credentialId: 'CSF-2024-001234',
    score: 98,
    instructor: 'John Martinez',
    icon: Shield,
    color: 'from-danger to-red-600',
    status: 'active'
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    courseName: 'Equipment Operator Certification',
    issueDate: '2024-02-10',
    expiryDate: '2027-02-10',
    credentialId: 'HEO-2024-005678',
    score: 95,
    instructor: 'Sarah Chen',
    icon: HardHat,
    color: 'from-warning to-orange-600',
    status: 'active'
  },
  {
    id: 3,
    title: 'Electrical Systems Installation',
    courseName: 'Advanced Electrical Training',
    issueDate: '2024-03-05',
    expiryDate: '2025-03-05',
    credentialId: 'ESI-2024-009012',
    score: 92,
    instructor: 'Mike Johnson',
    icon: Zap,
    color: 'from-secondary to-purple-600',
    status: 'expiring_soon'
  }
]

export default function CertificatesPage() {
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.certificates-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const handleDownload = (certificate: any) => {
    // Mock download functionality
    alert(`Downloading certificate: ${certificate.title}\nCredential ID: ${certificate.credentialId}`)
  }

  const handleShare = (certificate: any) => {
    // Mock share functionality
    alert(`Sharing certificate: ${certificate.title}\nCredential ID: ${certificate.credentialId}`)
  }

  const handleView = (certificate: any) => {
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

  return (
    <div className="space-y-6">
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
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
              <Award className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="certificates-item opacity-0 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-effect concrete-texture border-4 border-success/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-success to-green-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Total Earned</p>
                <p className="text-4xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mt-1">
                  {MOCK_CERTIFICATES.length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
                <Award className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-primary/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary to-blue-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Active</p>
                <p className="text-4xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mt-1">
                  {MOCK_CERTIFICATES.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect concrete-texture border-4 border-warning/40 relative">
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-warning to-orange-600"></div>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Expiring Soon</p>
                <p className="text-4xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mt-1">
                  {MOCK_CERTIFICATES.filter(c => c.status === 'expiring_soon').length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <Calendar className="text-white" size={28} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      {MOCK_CERTIFICATES.length > 0 ? (
        <div className="space-y-4">
          {MOCK_CERTIFICATES.map((certificate, index) => {
            const IconComponent = certificate.icon
            return (
              <Card
                key={certificate.id}
                className="certificates-item opacity-0 glass-effect concrete-texture border-4 border-success/20 hover:border-success/40 transition-all group relative overflow-hidden"
              >
                {/* Accent Bar */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${certificate.color}`}></div>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Certificate Info */}
                    <div className="lg:col-span-7">
                      <div className="flex items-start gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br ${certificate.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <IconComponent className="text-white" size={40} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-black text-neutral-800 group-hover:text-success transition-colors">
                                {certificate.title}
                              </h3>
                              <p className="text-sm text-neutral-600 mt-1">{certificate.courseName}</p>
                            </div>
                            {getStatusBadge(certificate.status)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            <div>
                              <p className="text-xs font-bold text-neutral-500 uppercase">Issue Date</p>
                              <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                <Calendar size={14} className="text-success" />
                                {new Date(certificate.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-500 uppercase">Expiry Date</p>
                              <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                <Calendar size={14} className={certificate.status === 'expiring_soon' ? 'text-warning' : 'text-primary'} />
                                {new Date(certificate.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-500 uppercase">Score</p>
                              <p className="text-sm font-semibold text-neutral-800 mt-1 flex items-center gap-1">
                                <CheckCircle size={14} className="text-success" />
                                {certificate.score}%
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 glass-effect border-2 border-neutral-200 rounded-lg p-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="font-bold text-neutral-600">Credential ID: </span>
                                <span className="font-mono text-neutral-800">{certificate.credentialId}</span>
                              </div>
                              <div>
                                <span className="font-bold text-neutral-600">Instructor: </span>
                                <span className="text-neutral-800">{certificate.instructor}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-5">
                      <div className="flex flex-col gap-3">
                        <Link href={`/certificates/${certificate.id}`} className="w-full">
                          <MagneticButton
                            className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center justify-center gap-2"
                          >
                            <Eye size={18} />
                            VIEW CERTIFICATE
                          </MagneticButton>
                        </Link>

                        <MagneticButton
                          onClick={() => handleDownload(certificate)}
                          className="w-full bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center justify-center gap-2"
                        >
                          <Download size={18} />
                          DOWNLOAD PDF
                        </MagneticButton>

                        <MagneticButton
                          onClick={() => handleShare(certificate)}
                          className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center justify-center gap-2"
                        >
                          <Share2 size={18} />
                          SHARE
                        </MagneticButton>

                        <button
                          className="w-full glass-effect border-2 border-secondary/30 hover:border-secondary/60 rounded-lg py-3 font-bold text-sm text-secondary flex items-center justify-center gap-2 transition-all"
                        >
                          <ExternalLink size={16} />
                          Verify Credential
                        </button>
                      </div>

                      {/* Certificate Preview Card */}
                      <div className="mt-4 glass-effect border-4 border-success/20 rounded-lg p-4 bg-gradient-to-br from-success/5 to-warning/5">
                        <div className="text-center">
                          <Award className="mx-auto text-success mb-2" size={32} />
                          <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Certificate of Completion</p>
                          <p className="text-sm font-black text-neutral-800">{certificate.title}</p>
                          <div className="mt-3 pt-3 border-t-2 border-neutral-200">
                            <p className="text-xs text-neutral-500">Awarded to</p>
                            <p className="text-sm font-bold text-neutral-800 mt-1">Your Name</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="certificates-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="text-neutral-400" size={48} />
            </div>
            <h3 className="text-xl font-bold text-neutral-700 mb-2">No certificates earned yet</h3>
            <p className="text-neutral-500 mb-6">
              Complete courses to earn certificates
            </p>
            <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
              BROWSE COURSES
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Certificate Modal/Viewer (Simple placeholder) */}
      {selectedCertificate && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedCertificate(null)}
        >
          <Card
            className="max-w-2xl w-full glass-effect concrete-texture border-4 border-success/40"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-black">Certificate Preview</CardTitle>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="w-10 h-10 bg-danger/20 hover:bg-danger/30 rounded-lg flex items-center justify-center transition-colors"
                >
                  <span className="text-danger font-black text-xl">×</span>
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
                    <p className="text-sm font-semibold text-neutral-800">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500">Credential ID</p>
                    <p className="text-sm font-mono font-semibold text-neutral-800">{selectedCertificate.credentialId}</p>
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

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, CheckCircle, XCircle, Loader2, Calendar, User, BookOpen, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function VerifyPage() {
  const params = useParams()
  const code = params.code as string

  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [certificateData, setCertificateData] = useState<any>(null)

  useEffect(() => {
    if (code) {
      verifyCode()
    }
  }, [code])

  const verifyCode = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/certificates/verify/${code}`)
      const data = await response.json()

      if (response.ok && data.success) {
        setVerified(true)
        setCertificateData(data.data)
      } else {
        setError(data.error || data.message || 'Failed to verify certificate')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('An error occurred while verifying the certificate')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary/5 to-success/5 flex items-center justify-center p-4">
        <Card className="glass-effect concrete-texture border-4 border-primary/40 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Loader2 className="animate-spin h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-xl font-black text-neutral-800 mb-2">Verifying Certificate...</h2>
            <p className="text-neutral-600">Please wait while we verify the credential</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-danger/5 to-warning/5 flex items-center justify-center p-4">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-danger to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-white" size={48} />
            </div>
            <h2 className="text-2xl font-black text-neutral-800 mb-2">Verification Failed</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <div className="glass-effect border-2 border-warning/30 rounded-lg p-4 bg-warning/5">
              <p className="text-sm text-neutral-700">
                <strong>What to do:</strong>
                <br />
                • Double-check the verification code
                <br />
                • Contact the certificate issuer
                <br />
                • Request a new verification link
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verified && certificateData) {
    const { certificate, recipient, course, completion, isExpired } = certificateData
    const issuedDate = new Date(certificate.issuedAt)
    const expiryDate = certificate.expiresAt ? new Date(certificate.expiresAt) : null

    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-success/5 to-primary/5 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="glass-effect concrete-texture border-4 border-success/40">
            <CardContent className="py-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-success to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={56} />
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-success via-primary to-success bg-clip-text text-transparent mb-2">
                CERTIFICATE VERIFIED
              </h1>
              <p className="text-lg text-neutral-700 font-semibold">
                This credential is authentic and valid
              </p>
            </CardContent>
          </Card>

          {/* Expiry Warning (if applicable) */}
          {isExpired && (
            <Card className="glass-effect concrete-texture border-4 border-warning/40">
              <CardContent className="py-4">
                <div className="flex items-center gap-3 text-warning">
                  <AlertTriangle size={24} />
                  <div>
                    <p className="font-black text-neutral-800">Certificate Expired</p>
                    <p className="text-sm text-neutral-600">
                      This certificate expired on {expiryDate?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certificate Details */}
          <Card className="glass-effect concrete-texture border-4 border-primary/40">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Award className="text-primary" size={28} />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Course Title */}
              <div className="glass-effect border-2 border-success/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-600 uppercase mb-1">Course Title</p>
                    <p className="text-lg font-black text-neutral-800">{course.title}</p>
                    {course.description && (
                      <p className="text-sm text-neutral-600 mt-2">{course.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Recipient */}
              <div className="glass-effect border-2 border-primary/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-neutral-600 uppercase mb-1">Awarded To</p>
                    <p className="text-lg font-black text-neutral-800">{recipient.name}</p>
                    <p className="text-sm text-neutral-500 mt-1">@{recipient.emailDomain}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-effect border-2 border-warning/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Issued</p>
                      <p className="text-sm font-black text-neutral-800">
                        {issuedDate.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatDistanceToNow(issuedDate, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                {expiryDate && (
                  <div className="glass-effect border-2 border-secondary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-600 uppercase mb-1">
                          {isExpired ? 'Expired' : 'Expires'}
                        </p>
                        <p className="text-sm font-black text-neutral-800">
                          {expiryDate.toLocaleDateString()}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {isExpired
                            ? `${formatDistanceToNow(expiryDate)} ago`
                            : `in ${formatDistanceToNow(expiryDate)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="glass-effect border-2 border-neutral-200 rounded-lg p-4 bg-neutral-50/50">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Instructor</p>
                    <p className="text-sm font-black text-neutral-800">{course.instructor}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-600 uppercase mb-1">Completion</p>
                    <p className="text-sm font-black text-neutral-800">{completion.progress}%</p>
                  </div>
                </div>
              </div>

              {/* Verification Code */}
              <div className="glass-effect border-2 border-neutral-200 rounded-lg p-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
                <p className="text-xs font-bold text-neutral-600 uppercase mb-2 text-center">
                  Verification Code
                </p>
                <p className="text-center font-mono text-sm font-bold text-neutral-800 bg-white border-2 border-neutral-200 rounded px-3 py-2">
                  {certificate.verificationCode}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-neutral-500">
            <p>This certificate was verified on {new Date().toLocaleString()}</p>
            <p className="mt-1">Powered by Civilabs LMS</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

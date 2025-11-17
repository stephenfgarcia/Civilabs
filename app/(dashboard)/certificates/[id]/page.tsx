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
  Shield
} from 'lucide-react'
import Link from 'next/link'

// Mock certificate data
const MOCK_CERTIFICATES = {
  1: {
    id: 1,
    title: 'Construction Safety Fundamentals',
    courseName: 'Safety Training Level 1',
    issueDate: '2024-01-15',
    expiryDate: '2026-01-15',
    credentialId: 'CSF-2024-001234',
    score: 98,
    instructor: 'John Martinez',
    instructorTitle: 'Safety Director',
    institution: 'Civilabs Construction Academy',
    description: 'This certifies that the learner has successfully completed the Construction Safety Fundamentals course, demonstrating proficiency in OSHA regulations, PPE usage, hazard identification, and emergency response procedures.',
    skills: [
      'OSHA Regulations Compliance',
      'Personal Protective Equipment (PPE) Selection',
      'Hazard Identification and Risk Assessment',
      'Emergency Response Procedures',
      'Safety Culture Development'
    ],
    hours: 4,
    status: 'active'
  },
  2: {
    id: 2,
    title: 'Heavy Equipment Operation',
    courseName: 'Equipment Operator Certification',
    issueDate: '2024-02-10',
    expiryDate: '2026-02-10',
    credentialId: 'HEO-2024-005678',
    score: 92,
    instructor: 'Mike Johnson',
    instructorTitle: 'Equipment Specialist',
    institution: 'Civilabs Construction Academy',
    description: 'This certificate verifies successful completion of the Heavy Equipment Operation course, including hands-on training and assessment in operating excavators, bulldozers, and other construction machinery.',
    skills: [
      'Excavator Operation',
      'Bulldozer Control',
      'Pre-Operation Inspection',
      'Safety Protocols',
      'Equipment Maintenance'
    ],
    hours: 12,
    status: 'active'
  }
}

export default function CertificateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const certId = parseInt(params.id as string)

  const [certificate, setCertificate] = useState(MOCK_CERTIFICATES[certId as keyof typeof MOCK_CERTIFICATES])

  useEffect(() => {
    if (!certificate) return

    const elements = document.querySelectorAll('.cert-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [certificate])

  if (!certificate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center">
          <h2 className="text-2xl font-black text-neutral-800 mb-4">CERTIFICATE NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">The certificate you're looking for doesn't exist.</p>
          <Link href="/certificates">
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO CERTIFICATES
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const handleDownload = () => {
    // In real app, would generate and download PDF
    alert('Certificate download will be implemented with PDF generation')
  }

  const handleShare = () => {
    // In real app, would open share dialog
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `I earned a certificate in ${certificate.title}!`,
        url: window.location.href
      })
    } else {
      alert('Certificate sharing functionality')
    }
  }

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
      <Card className="cert-item opacity-0 glass-effect border-8 border-warning/60 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-white to-orange-500/5"></div>

        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-4 left-4 w-24 h-24 border-t-8 border-l-8 border-warning/40"></div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-4 right-4 w-24 h-24 border-t-8 border-r-8 border-warning/40"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <div className="absolute bottom-4 left-4 w-24 h-24 border-b-8 border-l-8 border-warning/40"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-4 right-4 w-24 h-24 border-b-8 border-r-8 border-warning/40"></div>
        </div>

        <CardContent className="p-12 md:p-16 relative z-10">
          <div className="text-center space-y-8">
            {/* Institution Logo/Badge */}
            <div className="w-24 h-24 bg-gradient-to-br from-warning to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Shield className="text-white" size={48} />
            </div>

            {/* Certificate Title */}
            <div>
              <p className="text-sm font-bold text-neutral-600 uppercase tracking-wider mb-2">
                CERTIFICATE OF COMPLETION
              </p>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-warning via-orange-500 to-yellow-600 bg-clip-text text-transparent mb-4">
                {certificate.title}
              </h1>
              <p className="text-xl font-bold text-neutral-700">{certificate.courseName}</p>
            </div>

            {/* Recipient */}
            <div>
              <p className="text-sm font-bold text-neutral-600 uppercase mb-2">THIS CERTIFIES THAT</p>
              <p className="text-4xl font-black text-neutral-800">[LEARNER NAME]</p>
            </div>

            {/* Description */}
            <p className="text-neutral-700 max-w-2xl mx-auto leading-relaxed">
              {certificate.description}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <Calendar className="mx-auto mb-2 text-warning" size={24} />
                <p className="text-xs font-bold text-neutral-600 uppercase">Issue Date</p>
                <p className="font-black text-neutral-800">{new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>

              <div className="text-center">
                <Star className="mx-auto mb-2 text-warning" size={24} />
                <p className="text-xs font-bold text-neutral-600 uppercase">Score</p>
                <p className="font-black text-neutral-800">{certificate.score}%</p>
              </div>

              <div className="text-center">
                <CheckCircle className="mx-auto mb-2 text-success" size={24} />
                <p className="text-xs font-bold text-neutral-600 uppercase">Status</p>
                <p className="font-black text-success uppercase">{certificate.status}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto pt-8">
              <div className="text-center">
                <div className="border-t-2 border-neutral-300 pt-4">
                  <p className="font-black text-neutral-800">{certificate.instructor}</p>
                  <p className="text-sm font-semibold text-neutral-600">{certificate.instructorTitle}</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t-2 border-neutral-300 pt-4">
                  <p className="font-black text-neutral-800">{certificate.institution}</p>
                  <p className="text-sm font-semibold text-neutral-600">Issuing Authority</p>
                </div>
              </div>
            </div>

            {/* Credential ID */}
            <div className="pt-8">
              <p className="text-xs font-bold text-neutral-500 uppercase">Credential ID: {certificate.credentialId}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificate Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Covered */}
        <Card className="cert-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-black text-neutral-800">SKILLS COVERED</h3>
            </div>
            <ul className="space-y-3">
              {certificate.skills.map((skill, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="text-success flex-shrink-0 mt-1" size={18} />
                  <span className="font-medium text-neutral-700">{skill}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Certificate Details */}
        <Card className="cert-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Award className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-black text-neutral-800">DETAILS</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Course Duration</p>
                <p className="font-bold text-neutral-800">{certificate.hours} hours</p>
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Instructor</p>
                <p className="font-bold text-neutral-800">{certificate.instructor}</p>
                <p className="text-sm text-neutral-600">{certificate.instructorTitle}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Valid Until</p>
                <p className="font-bold text-neutral-800">
                  {new Date(certificate.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-600 uppercase">Verification</p>
                <p className="text-sm text-neutral-700 font-medium break-all">{certificate.credentialId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

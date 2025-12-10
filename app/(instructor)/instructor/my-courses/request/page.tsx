'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useToast } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  BookOpen,
  Send,
  Info,
} from 'lucide-react'

export default function RequestCoursePage() {
  useAuth(['INSTRUCTOR'])
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    justification: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    // Simulate submitting request (in production, this would call an API)
    setTimeout(() => {
      toast({
        title: 'Request Submitted',
        description: 'Your course creation request has been submitted to the administrator for review.',
      })
      router.push('/instructor/my-courses')
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <Link href="/instructor/my-courses">
            <MagneticButton className="mb-4 bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
              <ArrowLeft className="mr-2" size={20} />
              BACK TO MY COURSES
            </MagneticButton>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
                REQUEST NEW COURSE
              </h1>
              <p className="text-sm font-bold text-neutral-600 mt-1">
                Submit a course creation request to the administrator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="text-warning flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-black text-neutral-800 mb-2">COURSE CREATION PROCESS</h3>
              <p className="text-neutral-700 leading-relaxed">
                Course creation requires administrator approval. Once you submit this request, an administrator will review your proposal and either create the course and assign it to you, or contact you for more information. You'll receive a notification when your request has been processed.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Form */}
      <Card className="glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <BookOpen className="text-primary" size={24} />
            COURSE REQUEST FORM
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                Course Title *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Advanced Construction Safety Management"
                required
                className="glass-effect border-2 border-primary/30 focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                Course Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide a comprehensive description of the course content, learning objectives, and target audience..."
                required
                className="glass-effect border-2 border-primary/30 focus:border-primary min-h-[150px]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                Proposed Category
              </label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Safety, Technical, Management"
                className="glass-effect border-2 border-primary/30 focus:border-primary font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                Justification / Business Need
              </label>
              <Textarea
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                placeholder="Explain why this course is needed, expected enrollment, and how it aligns with organizational goals..."
                className="glass-effect border-2 border-primary/30 focus:border-primary min-h-[120px]"
              />
            </div>

            <div className="flex gap-4">
              <Link href="/instructor/my-courses" className="flex-1">
                <MagneticButton
                  type="button"
                  className="w-full glass-effect border-2 border-neutral-300 text-neutral-700 font-black"
                >
                  CANCEL
                </MagneticButton>
              </Link>
              <MagneticButton
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-primary to-blue-600 text-white font-black disabled:opacity-50"
              >
                <Send className="mr-2" size={20} />
                {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
              </MagneticButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

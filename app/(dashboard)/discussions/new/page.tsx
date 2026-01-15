'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { MessageSquare, ArrowLeft, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/services'
import { useEntranceAnimation } from '@/lib/hooks'

export default function NewDiscussionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'GENERAL'
  })

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.new-discussion-item', staggerDelay: 0.1 }, [])

  const categories = [
    { value: 'GENERAL', label: 'General Discussion' },
    { value: 'QUESTIONS', label: 'Questions & Help' },
    { value: 'RESOURCES', label: 'Resources & Tips' },
    { value: 'ANNOUNCEMENTS', label: 'Announcements' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post('/discussions', {
        title: formData.title,
        content: formData.content,
        category: formData.category
      })

      if (response.status >= 200 && response.status < 300) {
        // Success - redirect to discussions list
        router.push('/discussions')
      } else {
        setError(response.error || 'Failed to create discussion')
      }
    } catch (err) {
      console.error('Error creating discussion:', err)
      setError(err instanceof Error ? err.message : 'Failed to create discussion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6" role="main" aria-label="Create new discussion">
      {/* Header */}
      <header className="new-discussion-item opacity-0 glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-success/40">
        {/* Blueprint corner markers */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-success/60" aria-hidden="true"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-success/60" aria-hidden="true"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-success/60" aria-hidden="true"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-success/60" aria-hidden="true"></div>

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-success via-green-500 to-teal-500 opacity-10" aria-hidden="true"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20" aria-hidden="true"></div>

        <div className="relative z-10">
          <Link href="/discussions" aria-label="Back to discussions list">
            <MagneticButton className="mb-4 bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
              <ArrowLeft className="mr-2" size={20} aria-hidden="true" />
              BACK TO DISCUSSIONS
            </MagneticButton>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center" aria-hidden="true">
              <MessageSquare className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-success via-green-500 to-teal-500 bg-clip-text text-transparent">
                START NEW DISCUSSION
              </h1>
              <p className="text-sm font-bold text-neutral-600 mt-1">
                SHARE YOUR THOUGHTS WITH THE COMMUNITY
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <Card className="new-discussion-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <MessageSquare className="text-success" size={24} aria-hidden="true" />
            CREATE DISCUSSION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" aria-label="New discussion form">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg" role="alert" aria-live="polite">
                <p className="text-red-600 font-bold">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="discussion-title" className="block text-sm font-bold text-neutral-700 mb-2">
                DISCUSSION TITLE *
              </label>
              <Input
                id="discussion-title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter a clear and descriptive title..."
                className="border-2 border-neutral-300 focus:border-success font-medium"
                required
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="discussion-category" className="block text-sm font-bold text-neutral-700 mb-2">
                CATEGORY *
              </label>
              <select
                id="discussion-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-success font-medium"
                required
                aria-required="true"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="discussion-content" className="block text-sm font-bold text-neutral-700 mb-2">
                CONTENT *
              </label>
              <textarea
                id="discussion-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Share your thoughts, questions, or ideas..."
                rows={10}
                className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 focus:border-success font-medium resize-none"
                required
                aria-required="true"
              />
            </div>

            <div className="flex gap-4" role="group" aria-label="Form actions">
              <MagneticButton
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black"
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} aria-hidden="true" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={20} aria-hidden="true" />
                    POST DISCUSSION
                  </>
                )}
              </MagneticButton>

              <Link href="/discussions" aria-label="Cancel and return to discussions">
                <MagneticButton
                  type="button"
                  className="bg-gradient-to-r from-neutral-400 to-neutral-600 text-white font-black"
                >
                  CANCEL
                </MagneticButton>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

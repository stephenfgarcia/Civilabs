'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { HelpCircle, Mail, Phone, MessageCircle, Book, Video, FileText, ChevronDown, ChevronUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast, useEntranceAnimation } from '@/lib/hooks'
import { LoadingState, NoResultsState } from '@/components/ui/page-states'
import { sanitizeSearchQuery } from '@/lib/utils/sanitize'

// Mock FAQ data
const FAQ_CATEGORIES = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Book,
    faqs: [
      {
        question: 'How do I enroll in a course?',
        answer: 'Navigate to the Courses page, browse available courses, and click the "ENROLL NOW" button on any course card. You will be automatically enrolled and can start learning immediately.'
      },
      {
        question: 'How do I track my learning progress?',
        answer: 'Visit the "My Learning" page to view all your enrolled courses, track progress percentages, and see your next lessons. You can also check your overall stats on the Dashboard.'
      },
      {
        question: 'What is the difference between courses and certificates?',
        answer: 'Courses are training modules you can enroll in. After successfully completing a course with a passing score, you will earn a certificate that can be viewed and downloaded from the Certificates page.'
      }
    ]
  },
  {
    id: 'courses',
    title: 'Courses & Learning',
    icon: Video,
    faqs: [
      {
        question: 'Can I take multiple courses at the same time?',
        answer: 'Yes! You can enroll in as many courses as you want and learn at your own pace. We recommend focusing on 2-3 courses at a time for the best learning experience.'
      },
      {
        question: 'How long do I have access to a course?',
        answer: 'Once enrolled, you have unlimited access to the course materials. You can revisit lessons and review content anytime you need.'
      },
      {
        question: 'What happens if I fail an assessment?',
        answer: 'You can retake assessments as many times as needed. We encourage you to review the course materials before retaking to improve your understanding.'
      }
    ]
  },
  {
    id: 'certificates',
    title: 'Certificates',
    icon: FileText,
    faqs: [
      {
        question: 'How do I download my certificate?',
        answer: 'Go to the Certificates page, find your earned certificate, and click the "DOWNLOAD PDF" button. The certificate will be downloaded to your device in PDF format.'
      },
      {
        question: 'Do certificates expire?',
        answer: 'Some certificates have expiry dates (shown on the certificate card). You will receive notifications when a certificate is expiring soon so you can renew your certification.'
      },
      {
        question: 'Can I share my certificates with employers?',
        answer: 'Yes! Use the "SHARE" button on any certificate to share it via email or social media. You can also use the "Verify Credential" link to provide proof of authenticity.'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: HelpCircle,
    faqs: [
      {
        question: 'How do I update my profile information?',
        answer: 'Visit the Profile page and click the "EDIT PROFILE" button. You can update your name, email, department, position, and other details. Remember to click "SAVE" when done.'
      },
      {
        question: 'How is my ranking calculated on the leaderboard?',
        answer: 'Your ranking is based on total points earned from completing courses, assessments, and maintaining learning streaks. Check the Leaderboard page to see your current position.'
      },
      {
        question: 'What are achievement badges?',
        answer: 'Achievement badges are earned by completing specific milestones like finishing your first course, maintaining streaks, or achieving high scores. View all your badges on the Profile page.'
      }
    ]
  }
]

// Helper function to map icon names to components
const getIconComponent = (iconName: string | null) => {
  const iconMap: { [key: string]: any } = {
    'Book': Book,
    'Video': Video,
    'FileText': FileText,
    'HelpCircle': HelpCircle,
  }
  return iconMap[iconName || 'HelpCircle'] || HelpCircle
}

// Contact options - using environment variables for easy configuration
const CONTACT_OPTIONS = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    icon: Mail,
    contact: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@civilabs.com',
    color: 'from-primary to-blue-600'
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us during business hours',
    icon: Phone,
    contact: process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+1 (555) 123-4567',
    color: 'from-success to-green-600'
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: MessageCircle,
    contact: process.env.NEXT_PUBLIC_SUPPORT_HOURS || 'Available Mon-Fri 9am-5pm',
    color: 'from-warning to-orange-600'
  }
]

export default function HelpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [faqCategories, setFaqCategories] = useState(FAQ_CATEGORIES)
  const [filteredCategories, setFilteredCategories] = useState(FAQ_CATEGORIES)
  const [loading, setLoading] = useState(true)

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.help-item', staggerDelay: 0.05 }, [loading])

  useEffect(() => {
    // Fetch FAQs from API
    const fetchFaqs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/faqs')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data && data.data.length > 0) {
            // Map API data to match the expected format
            const mappedCategories = data.data.map((cat: any) => ({
              id: cat.slug,
              title: cat.title,
              icon: getIconComponent(cat.icon),
              faqs: cat.faqs.map((faq: any) => ({
                question: faq.question,
                answer: faq.answer
              }))
            }))
            setFaqCategories(mappedCategories)
            setFilteredCategories(mappedCategories)
          }
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        // Continue with hardcoded FAQs as fallback
      } finally {
        setLoading(false)
      }
    }

    fetchFaqs()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = faqCategories.map(category => ({
        ...category,
        faqs: category.faqs.filter(
          faq =>
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.faqs.length > 0)
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(faqCategories)
    }
  }, [searchQuery, faqCategories])

  const toggleFaq = (categoryId: string, faqIndex: number) => {
    const faqId = `${categoryId}-${faqIndex}`
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading help resources..." />
  }

  return (
    <div className="space-y-6" role="main" aria-label="Help and Support">
      {/* Page Header */}
      <div className="help-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-success to-warning bg-clip-text text-transparent">
              HELP & SUPPORT
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Find answers and get the help you need
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <HelpCircle className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="help-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardContent className="p-6">
          <div className="relative" role="search">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} aria-hidden="true" />
            <Input
              type="search"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
              className="pl-14 h-16 glass-effect border-2 border-primary/30 focus:border-primary text-lg font-medium"
              aria-label="Search help articles"
              maxLength={200}
              aria-describedby="search-results-count"
            />
            <span id="search-results-count" className="sr-only">
              {searchQuery && `${filteredCategories.reduce((acc, cat) => acc + cat.faqs.length, 0)} results found`}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Contact Options */}
      <section className="help-item opacity-0" aria-labelledby="contact-options-heading">
        <h2 id="contact-options-heading" className="sr-only">Contact Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTACT_OPTIONS.map(option => {
            const IconComponent = option.icon
            return (
              <Card key={option.id} className="glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${option.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`} aria-hidden="true">
                    <IconComponent className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-neutral-800 mb-1">{option.title}</h3>
                  <p className="text-sm text-neutral-600 mb-3">{option.description}</p>
                  <p className="text-sm font-bold text-primary">{option.contact}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* FAQ Categories */}
      {filteredCategories.map((category) => {
        const IconComponent = category.icon
        return (
          <Card
            key={category.id}
            className="help-item opacity-0 glass-effect concrete-texture border-4 border-warning/40"
            role="region"
            aria-labelledby={`faq-category-${category.id}`}
          >
            <CardHeader>
              <CardTitle
                id={`faq-category-${category.id}`}
                className="text-2xl font-black flex items-center gap-2"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                  <IconComponent className="text-white" size={20} />
                </div>
                {category.title.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3" role="list" aria-label={`${category.title} frequently asked questions`}>
                {category.faqs.map((faq, faqIndex) => {
                  const faqId = `${category.id}-${faqIndex}`
                  const isExpanded = expandedFaq === faqId
                  const answerId = `faq-answer-${faqId}`

                  return (
                    <div
                      key={faqIndex}
                      className="glass-effect border-2 border-neutral-200 rounded-lg overflow-hidden transition-all"
                      role="listitem"
                    >
                      <button
                        onClick={() => toggleFaq(category.id, faqIndex)}
                        className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors text-left"
                        aria-expanded={isExpanded}
                        aria-controls={answerId}
                      >
                        <span className="font-bold text-neutral-800 pr-4">{faq.question}</span>
                        {isExpanded ? (
                          <ChevronUp className="text-primary flex-shrink-0" size={24} aria-hidden="true" />
                        ) : (
                          <ChevronDown className="text-neutral-400 flex-shrink-0" size={24} aria-hidden="true" />
                        )}
                      </button>
                      <div
                        id={answerId}
                        role="region"
                        aria-labelledby={`faq-question-${faqId}`}
                        hidden={!isExpanded}
                        className={isExpanded ? "px-4 pb-4 border-t-2 border-neutral-200 pt-4 bg-primary/5" : ""}
                      >
                        {isExpanded && (
                          <p className="text-neutral-700 leading-relaxed">{faq.answer}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* No Results */}
      {searchQuery && filteredCategories.length === 0 && (
        <div className="help-item opacity-0">
          <NoResultsState
            searchTerm={searchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>
      )}

      {/* Additional Resources */}
      <Card className="help-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
              <Book className="text-white" size={20} />
            </div>
            ADDITIONAL RESOURCES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'Video tutorials will be available in a future update',
                })
              }}
              className="glass-effect border-2 border-success/20 rounded-lg p-6 hover:border-success/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="text-white" size={24} />
              </div>
              <h3 className="font-black text-neutral-800 mb-2">Video Tutorials</h3>
              <p className="text-sm text-neutral-600">
                Watch step-by-step video guides on how to use the platform
              </p>
            </div>

            <div
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'User guide will be available for download in a future update',
                })
              }}
              className="glass-effect border-2 border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Book className="text-white" size={24} />
              </div>
              <h3 className="font-black text-neutral-800 mb-2">User Guide</h3>
              <p className="text-sm text-neutral-600">
                Download the complete user manual and documentation
              </p>
            </div>

            <div
              onClick={() => router.push('/discussions')}
              className="glass-effect border-2 border-warning/20 rounded-lg p-6 hover:border-warning/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="text-white" size={24} />
              </div>
              <h3 className="font-black text-neutral-800 mb-2">Community Forum</h3>
              <p className="text-sm text-neutral-600">
                Join discussions and get help from other learners
              </p>
            </div>

            <div
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'Release notes will be available in a future update',
                })
              }}
              className="glass-effect border-2 border-secondary/20 rounded-lg p-6 hover:border-secondary/40 transition-all group cursor-pointer"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={24} />
              </div>
              <h3 className="font-black text-neutral-800 mb-2">Release Notes</h3>
              <p className="text-sm text-neutral-600">
                Stay updated with the latest features and improvements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card className="help-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardContent className="py-12 text-center">
          <HelpCircle className="mx-auto text-primary mb-4" size={64} />
          <h3 className="text-2xl font-black text-neutral-800 mb-2">Still need help?</h3>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you with any questions or issues.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <MagneticButton
              onClick={() => {
                const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@civilabs.com'
                toast({
                  title: 'Email Support',
                  description: `Please send your questions to ${supportEmail}. Our team will respond within 24 hours.`,
                })
              }}
              className="bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center gap-2"
            >
              <Mail size={18} />
              CONTACT SUPPORT
            </MagneticButton>
            <MagneticButton
              onClick={() => {
                toast({
                  title: 'Live Chat Coming Soon',
                  description: 'Live chat support will be available in a future update. For now, please contact us via email.',
                })
              }}
              className="bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center gap-2"
            >
              <MessageCircle size={18} />
              START LIVE CHAT
            </MagneticButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

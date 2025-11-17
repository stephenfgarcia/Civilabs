'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  Search,
  BookOpen,
  FileText,
  Award,
  Users,
  Clock,
  ChevronRight,
  Filter,
  X
} from 'lucide-react'
import Link from 'next/link'

type SearchResultType = 'course' | 'lesson' | 'instructor' | 'certificate'

interface SearchResult {
  id: number
  type: SearchResultType
  title: string
  description: string
  category?: string
  duration?: string
  students?: number
  url: string
  icon: any
  color: string
  metadata?: string
}

// Mock search results
const MOCK_RESULTS: SearchResult[] = [
  {
    id: 1,
    type: 'course',
    title: 'Construction Safety Fundamentals',
    description: 'Essential safety protocols and procedures for construction sites',
    category: 'Safety',
    duration: '4 hours',
    students: 245,
    url: '/courses/1',
    icon: BookOpen,
    color: 'from-danger to-red-600'
  },
  {
    id: 2,
    type: 'lesson',
    title: 'OSHA Regulations Overview',
    description: 'Learn about OSHA standards and regulations that govern construction site safety',
    metadata: 'Construction Safety Fundamentals > Module 1',
    duration: '12 min',
    url: '/courses/1/lessons/2',
    icon: FileText,
    color: 'from-primary to-blue-600'
  },
  {
    id: 3,
    type: 'lesson',
    title: 'Safety Culture in Construction',
    description: 'Understand the importance of safety culture and how to foster a safety-first mindset',
    metadata: 'Construction Safety Fundamentals > Module 1',
    duration: '8 min',
    url: '/courses/1/lessons/3',
    icon: FileText,
    color: 'from-primary to-blue-600'
  },
  {
    id: 4,
    type: 'course',
    title: 'Heavy Equipment Operation',
    description: 'Learn to operate excavators, bulldozers, and cranes safely',
    category: 'Equipment',
    duration: '12 hours',
    students: 189,
    url: '/courses/2',
    icon: BookOpen,
    color: 'from-warning to-orange-600'
  },
  {
    id: 5,
    type: 'certificate',
    title: 'Construction Safety Fundamentals Certificate',
    description: 'Awarded for completing the Construction Safety Fundamentals course',
    metadata: 'Issued: January 15, 2024',
    url: '/certificates',
    icon: Award,
    color: 'from-success to-green-600'
  }
]

const RESULT_TYPES = [
  { value: 'all', label: 'All Results' },
  { value: 'course', label: 'Courses' },
  { value: 'lesson', label: 'Lessons' },
  { value: 'instructor', label: 'Instructors' },
  { value: 'certificate', label: 'Certificates' }
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [activeQuery, setActiveQuery] = useState(initialQuery)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.search-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [results])

  useEffect(() => {
    // Simulate search
    if (activeQuery) {
      const filtered = MOCK_RESULTS.filter(result =>
        result.title.toLowerCase().includes(activeQuery.toLowerCase()) ||
        result.description.toLowerCase().includes(activeQuery.toLowerCase())
      )

      if (selectedType !== 'all') {
        setResults(filtered.filter(r => r.type === selectedType))
      } else {
        setResults(filtered)
      }
    } else {
      setResults([])
    }
  }, [activeQuery, selectedType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveQuery(searchQuery)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setActiveQuery('')
    setResults([])
  }

  const resultCount = results.length
  const typeCount = (type: string) => {
    if (type === 'all') return MOCK_RESULTS.length
    return MOCK_RESULTS.filter(r => r.type === type).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="search-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <Search className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
                  SEARCH
                </h1>
                <p className="text-sm font-bold text-neutral-600 mt-1">
                  FIND COURSES, LESSONS, AND MORE
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={24} />
              <Input
                type="text"
                placeholder="Search for courses, lessons, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-14 pr-14 h-16 glass-effect border-2 border-primary/30 focus:border-primary text-lg font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X size={24} />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeQuery && (
        <Card className="search-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center">
                <Filter className="text-white" size={20} />
              </div>
              FILTER RESULTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 flex-wrap">
              {RESULT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    selectedType === type.value
                      ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                  }`}
                >
                  {type.label} ({typeCount(type.value)})
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {activeQuery ? (
        resultCount > 0 ? (
          <div className="space-y-4">
            <div className="search-item opacity-0">
              <p className="text-lg font-bold text-neutral-700">
                Found {resultCount} {resultCount === 1 ? 'result' : 'results'} for "{activeQuery}"
              </p>
            </div>

            {results.map((result) => {
              const Icon = result.icon

              return (
                <Link key={`${result.type}-${result.id}`} href={result.url}>
                  <Card className="search-item opacity-0 glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-16 h-16 bg-gradient-to-br ${result.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg`}>
                          <Icon className="text-white" size={28} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-secondary to-purple-600 text-white uppercase">
                              {result.type}
                            </span>
                            {result.category && (
                              <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">
                                {result.category}
                              </span>
                            )}
                          </div>

                          <h3 className="text-2xl font-black text-neutral-800 mb-2 group-hover:text-primary transition-colors">
                            {result.title}
                          </h3>
                          <p className="text-neutral-600 mb-4 line-clamp-2">
                            {result.description}
                          </p>

                          {result.metadata && (
                            <p className="text-sm font-semibold text-neutral-500 mb-3">
                              {result.metadata}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center gap-6 flex-wrap">
                            {result.duration && (
                              <div className="flex items-center gap-2">
                                <Clock className="text-primary" size={16} />
                                <span className="text-sm font-bold text-neutral-700">{result.duration}</span>
                              </div>
                            )}
                            {result.students && (
                              <div className="flex items-center gap-2">
                                <Users className="text-success" size={16} />
                                <span className="text-sm font-bold text-neutral-700">{result.students} students</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-primary font-bold text-sm ml-auto">
                              View Details
                              <ChevronRight size={16} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <Card className="search-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
            <CardContent className="py-16 text-center">
              <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-neutral-400" size={48} />
              </div>
              <h3 className="text-2xl font-black text-neutral-700 mb-2">NO RESULTS FOUND</h3>
              <p className="text-neutral-600 font-semibold mb-6 max-w-md mx-auto">
                No results found for "{activeQuery}". Try different keywords or browse our course catalog.
              </p>
              <Link href="/courses">
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  <BookOpen className="mr-2" size={20} />
                  BROWSE COURSES
                </MagneticButton>
              </Link>
            </CardContent>
          </Card>
        )
      ) : (
        <Card className="search-item opacity-0 glass-effect concrete-texture border-4 border-neutral-300">
          <CardContent className="py-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-white" size={48} />
            </div>
            <h3 className="text-2xl font-black text-neutral-700 mb-2">START SEARCHING</h3>
            <p className="text-neutral-600 font-semibold mb-8 max-w-md mx-auto">
              Enter keywords above to search across courses, lessons, instructors, and certificates.
            </p>

            <div className="max-w-2xl mx-auto">
              <h4 className="font-black text-neutral-800 mb-4">POPULAR SEARCHES</h4>
              <div className="flex flex-wrap gap-3 justify-center">
                {['Safety', 'Equipment', 'OSHA', 'PPE', 'Scaffolding', 'Excavator'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => {
                      setSearchQuery(keyword)
                      setActiveQuery(keyword)
                    }}
                    className="px-4 py-2 glass-effect border-2 border-primary/30 rounded-lg font-bold text-neutral-700 hover:border-primary/60 hover:bg-primary/5 transition-all"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

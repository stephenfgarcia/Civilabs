'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/page-states'
import { BookOpen, Search, Filter, HardHat, Award, Clock, Users, ChevronRight, Zap, Shield, Wrench, Loader2, AlertCircle, Bookmark, BookmarkCheck, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { coursesService } from '@/lib/services'
import { useToast, useEntranceAnimation } from '@/lib/hooks'
import { sanitizeSearchQuery } from '@/lib/utils/sanitize'

// Course interface based on API response
interface CourseCategory {
  id: string | number
  name: string
}

interface CourseInstructor {
  firstName: string
  lastName: string
}

interface CourseData {
  id: string | number
  title: string
  description?: string
  difficultyLevel?: string
  durationMinutes?: number
  category?: CourseCategory
  instructor?: CourseInstructor
  _count?: {
    enrollments?: number
    lessons?: number
  }
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Safety: Shield,
  Equipment: Wrench,
  Technical: BookOpen,
  Management: HardHat,
  Quality: Award,
  Construction: HardHat,
  Engineering: Zap,
}

// Helper function to get category accent bar classes
const getCategoryAccentBarClass = (categoryName: string) => {
  switch (categoryName) {
    case 'Safety':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-danger to-red-600'
    case 'Equipment':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-orange-600'
    case 'Technical':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
    case 'Management':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-success to-green-600'
    case 'Quality':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-secondary to-purple-600'
    case 'Construction':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-warning to-orange-600'
    case 'Engineering':
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
    default:
      return 'absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-blue-600'
  }
}

// Helper function to get category icon background classes
const getCategoryIconBgClass = (categoryName: string) => {
  switch (categoryName) {
    case 'Safety':
      return 'w-14 h-14 bg-gradient-to-br from-danger to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Equipment':
      return 'w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Technical':
      return 'w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Management':
      return 'w-14 h-14 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Quality':
      return 'w-14 h-14 bg-gradient-to-br from-secondary to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Construction':
      return 'w-14 h-14 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    case 'Engineering':
      return 'w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
    default:
      return 'w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform'
  }
}

const LEVELS = ['All Levels', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export default function CoursesPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All Levels')
  const [courses, setCourses] = useState<CourseData[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [filteredCourses, setFilteredCourses] = useState<CourseData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarkedCourses, setBookmarkedCourses] = useState<Set<string>>(new Set())
  const [togglingBookmarks, setTogglingBookmarks] = useState<Set<string>>(new Set())

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.courses-item', staggerDelay: 0.05 }, [loading, filteredCourses])

  useEffect(() => {
    // Fetch courses and bookmarks on mount
    fetchCourses()
    fetchBookmarks()
  }, [])

  useEffect(() => {
    // Filter courses whenever filters change
    let filtered = courses

    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(course => course.category?.name === selectedCategory)
    }

    if (selectedLevel !== 'All Levels') {
      filtered = filtered.filter(course => course.difficultyLevel === selectedLevel)
    }

    setFilteredCourses(filtered)
  }, [searchQuery, selectedCategory, selectedLevel, courses])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all courses
      const response = await coursesService.getCourses()

      if (response.status >= 200 && response.status < 300 && response.data) {
        // Cast to CourseData[] since API response format differs from service types
        const coursesData = (Array.isArray(response.data) ? response.data : []) as unknown as CourseData[]
        setCourses(coursesData)
        setFilteredCourses(coursesData)

        // Extract unique categories
        const uniqueCategories = ['All', ...Array.from(new Set(coursesData.map((c) => c.category?.name).filter(Boolean)))] as string[]
        setCategories(uniqueCategories)
      } else {
        throw new Error(response.error || 'Failed to load courses')
      }
    } catch (err) {
      console.error('Error fetching courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/bookmarks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const bookmarkedCourseIds = new Set<string>(
          data.data.map((bookmark: any) => bookmark.courseId as string)
        )
        setBookmarkedCourses(bookmarkedCourseIds)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
    }
  }

  const toggleBookmark = async (courseId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent race condition - if already toggling this bookmark, return
    if (togglingBookmarks.has(courseId)) {
      return
    }

    try {
      // Mark as toggling
      setTogglingBookmarks(prev => new Set(prev).add(courseId))

      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: 'Authentication Required',
          description: 'Please login to bookmark courses',
          variant: 'destructive',
        })
        return
      }

      const isBookmarked = bookmarkedCourses.has(courseId)

      if (isBookmarked) {
        // Remove bookmark - find the bookmark ID first
        const response = await fetch('/api/bookmarks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        const bookmark = data.data.find((b: any) => b.courseId === courseId)

        if (bookmark) {
          await fetch(`/api/bookmarks/${bookmark.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          const newBookmarks = new Set(bookmarkedCourses)
          newBookmarks.delete(courseId)
          setBookmarkedCourses(newBookmarks)
          toast({
            title: 'Bookmark Removed',
            description: 'Course has been removed from your bookmarks',
          })
        }
      } else {
        // Add bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        })

        if (response.ok) {
          const newBookmarks = new Set(bookmarkedCourses)
          newBookmarks.add(courseId)
          setBookmarkedCourses(newBookmarks)
          toast({
            title: 'Bookmark Added',
            description: 'Course has been added to your bookmarks',
          })
        } else {
          throw new Error('Failed to add bookmark')
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast({
        title: 'Error',
        description: 'Failed to update bookmark. Please try again.',
        variant: 'destructive',
      })
    } finally {
      // Remove from toggling set
      setTogglingBookmarks(prev => {
        const next = new Set(prev)
        next.delete(courseId)
        return next
      })
    }
  }

  // Show loading state
  if (loading) {
    return <LoadingState message="Loading courses..." size="lg" />
  }

  // Show error state
  if (error) {
    return <ErrorState title="Error Loading Courses" message={error} onRetry={fetchCourses} />
  }

  return (
    <div className="space-y-6" role="main" aria-label="Training Catalog">
      {/* Page Header */}
      <div className="courses-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              TRAINING CATALOG
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Browse available construction training courses
            </p>
          </div>
          <div className="hidden md:block" aria-hidden="true">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="courses-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-6">
          <form role="search" aria-label="Search and filter courses" onSubmit={(e) => e.preventDefault()} className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} aria-hidden="true" />
              <Input
                id="course-search"
                type="search"
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(sanitizeSearchQuery(e.target.value))}
                className="pl-12 h-14 glass-effect border-2 border-warning/30 focus:border-warning text-base font-medium"
                aria-label="Search courses by title or description"
                maxLength={200}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="category-filter" className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                  <Filter size={16} className="text-warning" aria-hidden="true" />
                  CATEGORY
                </label>
                <select
                  id="category-filter"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-12 glass-effect border-2 border-warning/30 focus:border-warning rounded-lg px-4 font-medium"
                  aria-label="Filter by category"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label htmlFor="level-filter" className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                  <Award size={16} className="text-warning" aria-hidden="true" />
                  SKILL LEVEL
                </label>
                <select
                  id="level-filter"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full h-12 glass-effect border-2 border-warning/30 focus:border-warning rounded-lg px-4 font-medium"
                  aria-label="Filter by skill level"
                >
                  {LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm font-bold text-neutral-600" aria-live="polite" aria-atomic="true">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </p>
              {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All Levels') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('All')
                    setSelectedLevel('All Levels')
                  }}
                  className="text-sm font-bold text-danger hover:text-danger/80"
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <section aria-label="Course listings">
          <ul role="list" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-label={`${filteredCourses.length} courses available`}>
            {filteredCourses.map((course) => {
              const categoryName = course.category?.name || 'General'
              const IconComponent = CATEGORY_ICONS[categoryName] || BookOpen
              const difficultyLevel = course.difficultyLevel || 'BEGINNER'

              const courseId = String(course.id)
              const isBookmarked = bookmarkedCourses.has(courseId)

              return (
                <li key={courseId}>
                  <article className="courses-item opacity-0 relative h-full">
                    <Link href={`/courses/${courseId}`} className="block h-full" aria-label={`View ${course.title} course`}>
                      <Card
                        className="glass-effect concrete-texture border-4 border-primary/20 hover:border-primary/40 transition-all group relative overflow-hidden cursor-pointer h-full"
                      >
                        {/* Accent Bar */}
                        <div className={getCategoryAccentBarClass(categoryName)} aria-hidden="true"></div>

                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className={getCategoryIconBgClass(categoryName)} aria-hidden="true">
                              <IconComponent className="text-white" size={28} />
                            </div>
                            <div className="flex items-start gap-2">
                              <button
                                onClick={(e) => toggleBookmark(courseId, e)}
                                disabled={togglingBookmarks.has(courseId)}
                                className={`p-2 rounded-lg transition-all ${
                                  togglingBookmarks.has(courseId)
                                    ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed opacity-50'
                                    : isBookmarked
                                    ? 'bg-warning/20 text-warning hover:bg-warning/30'
                                    : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'
                                }`}
                                aria-label={
                                  togglingBookmarks.has(courseId)
                                    ? 'Processing bookmark...'
                                    : isBookmarked
                                    ? `Remove ${course.title} from bookmarks`
                                    : `Bookmark ${course.title}`
                                }
                                aria-pressed={isBookmarked}
                              >
                                {isBookmarked ? (
                                  <BookmarkCheck size={18} aria-hidden="true" />
                                ) : (
                                  <Bookmark size={18} aria-hidden="true" />
                                )}
                              </button>
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-warning/20 text-warning">
                                  {categoryName}
                                </span>
                                <span className="text-xs font-semibold text-neutral-600">
                                  {difficultyLevel}
                                </span>
                              </div>
                            </div>
                          </div>
                          <CardTitle className="text-xl font-black mt-4 group-hover:text-primary transition-colors">
                            {course.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-neutral-600 text-sm mb-6 line-clamp-2">
                            {course.description}
                          </p>

                          {/* Course Stats */}
                          <dl className="grid grid-cols-2 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                                <Clock className="text-primary" size={16} />
                              </div>
                              <div>
                                <dt className="text-xs text-neutral-500">Duration</dt>
                                <dd className="text-sm font-bold text-neutral-800">{course.durationMinutes ? `${Math.ceil(course.durationMinutes / 60)}h` : 'N/A'}</dd>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center" aria-hidden="true">
                                <Users className="text-success" size={16} />
                              </div>
                              <div>
                                <dt className="text-xs text-neutral-500">Students</dt>
                                <dd className="text-sm font-bold text-neutral-800">{course._count?.enrollments || 0}</dd>
                              </div>
                            </div>
                          </dl>

                          {/* View Course Button */}
                          <div className="w-full bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center justify-center gap-2 py-3 rounded-lg" aria-hidden="true">
                            VIEW COURSE
                            <ChevronRight size={18} />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </article>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <EmptyState
          icon={<Search size={48} />}
          title="No courses found"
          description="Try adjusting your search or filters"
          action={{
            label: 'Reset Filters',
            onClick: () => {
              setSearchQuery('')
              setSelectedCategory('All')
              setSelectedLevel('All Levels')
            }
          }}
        />
      )}
    </div>
  )
}

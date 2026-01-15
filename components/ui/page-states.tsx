'use client'

import { Loader2, AlertCircle, RefreshCw, Search, FileX } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { MagneticButton } from './magnetic-button'

/**
 * Loading State Component
 * Displays a construction-themed loading indicator
 */
interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const textClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  }

  return (
    <div
      className="flex items-center justify-center min-h-[40vh]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <Loader2
          className={`animate-spin mx-auto text-warning mb-4 ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        <p className={`font-bold text-neutral-700 ${textClasses[size]}`}>
          {message}
        </p>
        <span className="sr-only">Loading, please wait</span>
      </div>
    </div>
  )
}

/**
 * Error State Component
 * Displays an error message with retry option
 */
interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
}

export function ErrorState({
  title = 'Error Loading Data',
  message,
  onRetry,
  retryLabel = 'Try Again',
}: ErrorStateProps) {
  return (
    <div
      className="flex items-center justify-center min-h-[40vh]"
      role="alert"
      aria-live="assertive"
    >
      <Card className="glass-effect concrete-texture border-4 border-danger/40 max-w-md">
        {/* Blueprint corner markers */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-danger/60" />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-danger/60" />

        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2 text-danger">
            <AlertCircle aria-hidden="true" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-neutral-700 mb-4">{message}</p>
          {onRetry && (
            <MagneticButton
              onClick={onRetry}
              className="bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center gap-2"
              aria-label={retryLabel}
            >
              <RefreshCw size={18} aria-hidden="true" />
              {retryLabel}
            </MagneticButton>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Empty State Component
 * Displays when no data is available
 */
interface EmptyStateActionConfig {
  label: string
  onClick?: () => void
  href?: string
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: EmptyStateActionConfig | React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  // Check if action is a ReactNode or config object
  const isActionConfig = (value: unknown): value is EmptyStateActionConfig => {
    return typeof value === 'object' && value !== null && 'label' in value
  }

  let ActionButton: React.ReactNode = null

  if (action) {
    if (isActionConfig(action)) {
      // Handle config object
      ActionButton = action.href ? (
        <a href={action.href}>
          <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
            {action.label}
          </MagneticButton>
        </a>
      ) : action.onClick ? (
        <MagneticButton
          onClick={action.onClick}
          className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
        >
          {action.label}
        </MagneticButton>
      ) : null
    } else {
      // Handle ReactNode directly
      ActionButton = action
    }
  }

  return (
    <div className="text-center py-12" role="status">
      {icon ? (
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : (
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-full flex items-center justify-center mb-4">
          <FileX className="text-neutral-400" size={48} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-xl font-bold text-neutral-700 mb-2">{title}</h3>
      {description && (
        <p className="text-neutral-500 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {ActionButton}
    </div>
  )
}

/**
 * No Search Results Component
 * Displays when a search returns no results
 */
interface NoResultsStateProps {
  searchTerm?: string
  onClear?: () => void
}

export function NoResultsState({ searchTerm, onClear }: NoResultsStateProps) {
  return (
    <Card className="glass-effect concrete-texture border-4 border-neutral-300">
      <CardContent className="py-16 text-center">
        <div
          className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4"
          aria-hidden="true"
        >
          <Search className="text-neutral-400" size={48} />
        </div>
        <h3 className="text-xl font-bold text-neutral-700 mb-2" role="status">
          No results found
        </h3>
        <p className="text-neutral-500 mb-6">
          {searchTerm
            ? `No matches for "${searchTerm}". Try different keywords.`
            : 'Try searching with different keywords or browse all items.'}
        </p>
        {onClear && (
          <MagneticButton
            onClick={onClear}
            className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
            aria-label="Clear search and show all results"
          >
            Clear Search
          </MagneticButton>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton Loader for Cards
 * Construction-themed skeleton loading animation
 */
interface SkeletonCardProps {
  lines?: number
  showImage?: boolean
}

export function SkeletonCard({ lines = 3, showImage = true }: SkeletonCardProps) {
  return (
    <Card className="glass-effect concrete-texture border-4 border-neutral-200 animate-pulse">
      <CardContent className="p-6">
        <div className="flex gap-4">
          {showImage && (
            <div className="w-16 h-16 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg flex-shrink-0">
              {/* Blueprint grid pattern */}
              <div
                className="w-full h-full opacity-50"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 163, 224, 0.2) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 163, 224, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '8px 8px',
                }}
              />
            </div>
          )}
          <div className="flex-1 space-y-3">
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full"
                style={{ width: i === 0 ? '75%' : i === lines - 1 ? '50%' : '90%' }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Multiple Skeleton Cards
 */
interface SkeletonListProps {
  count?: number
  showImage?: boolean
}

export function SkeletonList({ count = 3, showImage = true }: SkeletonListProps) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} showImage={showImage} />
      ))}
    </div>
  )
}

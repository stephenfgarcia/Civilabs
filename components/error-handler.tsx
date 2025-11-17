/**
 * Error Handler Components
 * Pre-built error display components for common scenarios
 */

'use client'

import { AlertTriangle, Wifi, Lock, FileQuestion, RefreshCw } from 'lucide-react'
import { MagneticButton } from './ui/magnetic-button'

interface ErrorMessageProps {
  title: string
  message: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function ErrorMessage({
  title,
  message,
  icon,
  action,
  className = '',
}: ErrorMessageProps) {
  return (
    <div className={`glass-effect concrete-texture rounded-xl p-8 border-4 border-danger/40 ${className}`}>
      <div className="text-center">
        {icon && (
          <div className="w-16 h-16 bg-gradient-to-br from-danger to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            {icon}
          </div>
        )}

        <h3 className="text-2xl font-black text-neutral-800 mb-2">{title}</h3>
        <p className="text-neutral-600 mb-6">{message}</p>

        {action && (
          <MagneticButton
            onClick={action.onClick}
            className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
          >
            {action.label}
          </MagneticButton>
        )}
      </div>
    </div>
  )
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Network Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      icon={<Wifi className="text-white" size={32} />}
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
            }
          : undefined
      }
    />
  )
}

export function UnauthorizedError({ onLogin }: { onLogin?: () => void }) {
  return (
    <ErrorMessage
      title="Unauthorized Access"
      message="You don't have permission to access this resource. Please log in or contact an administrator."
      icon={<Lock className="text-white" size={32} />}
      action={
        onLogin
          ? {
              label: 'Log In',
              onClick: onLogin,
            }
          : undefined
      }
    />
  )
}

export function NotFoundError({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <ErrorMessage
      title="Not Found"
      message="The resource you're looking for doesn't exist or has been moved."
      icon={<FileQuestion className="text-white" size={32} />}
      action={
        onGoBack
          ? {
              label: 'Go Back',
              onClick: onGoBack,
            }
          : undefined
      }
    />
  )
}

export function ServerError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Server Error"
      message="Something went wrong on our end. We're working to fix it. Please try again later."
      icon={<AlertTriangle className="text-white" size={32} />}
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
            }
          : undefined
      }
    />
  )
}

export function GenericError({
  title = 'Error',
  message = 'An unexpected error occurred.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <ErrorMessage
      title={title}
      message={message}
      icon={<AlertTriangle className="text-white" size={32} />}
      action={
        onRetry
          ? {
              label: 'Try Again',
              onClick: onRetry,
            }
          : undefined
      }
    />
  )
}

interface ErrorStateProps {
  error: Error | string | null
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  if (!error) return null

  const errorMessage = typeof error === 'string' ? error : error.message

  // Check for specific error types
  if (errorMessage.toLowerCase().includes('network')) {
    return <NetworkError onRetry={onRetry} />
  }

  if (errorMessage.toLowerCase().includes('unauthorized') || errorMessage.toLowerCase().includes('403')) {
    return <UnauthorizedError onLogin={() => window.location.href = '/login'} />
  }

  if (errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('404')) {
    return <NotFoundError onGoBack={() => window.history.back()} />
  }

  if (errorMessage.toLowerCase().includes('server') || errorMessage.toLowerCase().includes('500')) {
    return <ServerError onRetry={onRetry} />
  }

  return <GenericError message={errorMessage} onRetry={onRetry} />
}

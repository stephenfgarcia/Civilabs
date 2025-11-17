/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { MagneticButton } from './ui/magnetic-button'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log to error reporting service (e.g., Sentry)
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
          <div className="max-w-2xl w-full">
            <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-danger/40">
              {/* Blueprint corner markers */}
              <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-danger/60"></div>
              <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-danger/60"></div>
              <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-danger/60"></div>
              <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-danger/60"></div>

              <div className="absolute inset-0 bg-gradient-to-r from-danger via-warning to-orange-500 opacity-10"></div>
              <div className="absolute inset-0 blueprint-grid opacity-20"></div>

              <div className="relative z-10 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-danger to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <AlertTriangle className="text-white" size={40} />
                </div>

                <h1 className="text-4xl font-black bg-gradient-to-r from-danger via-warning to-orange-500 bg-clip-text text-transparent mb-4">
                  SOMETHING WENT WRONG
                </h1>

                <p className="text-lg font-bold text-neutral-700 mb-6">
                  We encountered an unexpected error. Don't worry, our team has been notified.
                </p>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 bg-danger/10 border-2 border-danger/30 rounded-lg text-left">
                    <p className="font-black text-danger mb-2">Error Details (Development Only):</p>
                    <p className="text-sm font-mono text-neutral-700 mb-2">
                      {this.state.error.message}
                    </p>
                    {this.state.errorInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-bold text-sm text-neutral-600 hover:text-neutral-800">
                          Stack Trace
                        </summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-60 p-2 bg-neutral-900 text-green-400 rounded">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <MagneticButton
                    onClick={this.handleReset}
                    className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                  >
                    <RefreshCw className="mr-2" size={20} />
                    TRY AGAIN
                  </MagneticButton>

                  <MagneticButton
                    onClick={this.handleGoHome}
                    className="glass-effect border-2 border-primary/30 text-neutral-700 font-black hover:border-primary/60"
                  >
                    <Home className="mr-2" size={20} />
                    GO HOME
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

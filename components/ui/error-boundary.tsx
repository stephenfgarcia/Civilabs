'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { MagneticButton } from './magnetic-button'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center min-h-[60vh] p-4">
          <Card className="glass-effect concrete-texture border-4 border-danger/40 max-w-lg w-full">
            {/* Blueprint corner markers */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-danger/60" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-danger/60" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-danger/60" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-danger/60" />

            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-3 text-danger">
                <div
                  className="w-14 h-14 bg-gradient-to-br from-danger to-red-600 rounded-xl flex items-center justify-center"
                  role="img"
                  aria-label="Error icon"
                >
                  <AlertTriangle className="text-white" size={28} />
                </div>
                SOMETHING WENT WRONG
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-neutral-700 font-medium">
                We encountered an unexpected error. This has been logged and our team will investigate.
              </p>

              {this.state.error && process.env.NODE_ENV === 'development' && (
                <details className="glass-effect border-2 border-neutral-300 rounded-lg p-4">
                  <summary className="font-bold text-neutral-700 cursor-pointer">
                    Error Details (Development Only)
                  </summary>
                  <pre className="mt-2 text-xs text-danger overflow-auto max-h-32 p-2 bg-neutral-100 rounded">
                    {this.state.error.message}
                  </pre>
                </details>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <MagneticButton
                  onClick={this.handleRetry}
                  className="bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center gap-2"
                  aria-label="Try again"
                >
                  <RefreshCw size={18} />
                  TRY AGAIN
                </MagneticButton>
                <Link href="/dashboard">
                  <MagneticButton
                    className="bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center gap-2"
                    aria-label="Go to dashboard"
                  >
                    <Home size={18} />
                    GO TO DASHBOARD
                  </MagneticButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

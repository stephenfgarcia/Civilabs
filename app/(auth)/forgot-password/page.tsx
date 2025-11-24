'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ConstructionLoader } from '@/components/ui/construction-loader'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, HardHat, ShieldCheck, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple CSS-only entrance animation
    if (cardRef.current) {
      cardRef.current.style.animation = 'fadeInUp 0.5s ease-out forwards'
    }

    const elements = document.querySelectorAll('.forgot-icon, .forgot-title')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${0.1 + index * 0.05}s`
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your worker email address.')
      if (cardRef.current) {
        cardRef.current.style.animation = 'shake 0.4s ease-in-out'
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.animation = ''
          }
        }, 400)
      }
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Invalid email format. Please enter a valid worker email address.')
      if (cardRef.current) {
        cardRef.current.style.animation = 'shake 0.4s ease-in-out'
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.animation = ''
          }
        }, 400)
      }
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setSuccess(true)
      setEmail('')
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setError(err.message || 'Failed to send password reset email. Please try again.')
      if (cardRef.current) {
        cardRef.current.style.animation = 'shake 0.4s ease-in-out'
        setTimeout(() => {
          if (cardRef.current) {
            cardRef.current.style.animation = ''
          }
        }, 400)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Construction Blueprint Background */}
      <div className="absolute inset-0 blueprint-grid opacity-20"></div>
      <div className="absolute inset-0 concrete-texture"></div>

      {/* Construction warning stripes */}
      <div className="absolute top-0 left-0 w-full h-4 warning-stripes opacity-60 z-40"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 warning-stripes opacity-60 z-40"></div>

      {/* Simplified Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-gradient-to-r from-primary/25 to-blue-600/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-r from-warning/20 to-orange-600/20 rounded-full blur-3xl"></div>
      </div>

      <Card ref={cardRef} className="w-full max-w-lg relative z-10 glass-effect concrete-texture border-4 border-primary/40 shadow-2xl opacity-0">
        {/* Blueprint corner markers */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6 forgot-icon opacity-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <HardHat className="text-white" size={52} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
            </div>
          </div>
          <CardTitle className="forgot-title text-5xl font-black mb-2 opacity-0">
            <span className="bg-gradient-to-r from-primary via-blue-600 to-warning bg-clip-text text-transparent">
              RESET ACCESS
            </span>
          </CardTitle>
          <CardDescription className="forgot-title text-lg font-semibold text-neutral-600 opacity-0">
            Password Recovery Portal
          </CardDescription>
          <div className="forgot-title flex items-center justify-center gap-2 text-xs text-primary font-bold mt-3 opacity-0">
            <span>⚠</span>
            <span>SECURE PASSWORD RESET</span>
            <span>⚠</span>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          {loading ? (
            <div className="py-8">
              <ConstructionLoader text="Sending Reset Instructions..." />
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-success" size={48} />
              </div>
              <h3 className="text-2xl font-black text-success mb-4">CHECK YOUR EMAIL!</h3>
              <p className="text-neutral-700 mb-6 font-medium">
                If an account exists with that email, we've sent password reset instructions to your inbox.
              </p>
              <p className="text-sm text-neutral-600 mb-8">
                Didn't receive the email? Check your spam folder or try again in a few minutes.
              </p>
              <Link href="/login">
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  <ArrowLeft className="mr-2" size={20} />
                  BACK TO LOGIN
                </MagneticButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger/10 border-l-4 border-danger text-danger px-5 py-4 rounded-lg text-sm font-semibold animate-pulse warning-stripes">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⚠</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div className="bg-primary/10 border-l-4 border-primary text-primary px-5 py-4 rounded-lg text-sm font-semibold">
                <p className="mb-2">Enter your worker email address and we'll send you instructions to reset your security code.</p>
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="text-sm font-bold flex items-center gap-2 text-neutral-700">
                  <Mail size={18} className="text-primary" />
                  WORKER EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@civilabs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 glass-effect border-3 border-primary/30 focus:border-primary focus:ring-4 focus:ring-primary/20 text-lg font-medium"
                />
              </div>

              <MagneticButton
                type="submit"
                className="submit-button w-full h-16 bg-gradient-to-r from-primary via-blue-600 to-primary text-white text-xl font-black shadow-2xl hover:shadow-[0_0_60px_rgba(59,130,246,0.8)] border-2 border-white/30"
                disabled={loading}
              >
                <Mail className="mr-3" size={26} />
                SEND RESET INSTRUCTIONS
              </MagneticButton>

              <div className="text-center text-sm text-neutral-600 font-semibold pt-2">
                Remember your password?{' '}
                <Link href="/login" className="text-primary font-black hover:text-warning hover:underline transition-colors text-base">
                  RETURN TO LOGIN →
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

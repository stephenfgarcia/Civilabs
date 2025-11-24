'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ConstructionLoader } from '@/components/ui/construction-loader'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, HardHat, ShieldCheck, CheckCircle } from 'lucide-react'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Validate token exists
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.')
    }

    // Animation
    if (cardRef.current) {
      cardRef.current.style.animation = 'fadeInUp 0.5s ease-out forwards'
    }

    const elements = document.querySelectorAll('.reset-icon, .reset-title')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${0.1 + index * 0.05}s`
    })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!password.trim() || !confirmPassword.trim()) {
      setError('Both password fields are required.')
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

    if (password.length < 8) {
      setError('Security code must be at least 8 characters long for site protection.')
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

    if (password !== confirmPassword) {
      setError('Security codes do not match. Please verify both passwords.')
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
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err.message || 'Failed to reset password. Please try again.')
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
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-gradient-to-r from-success/25 to-green-600/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-gradient-to-r from-warning/20 to-orange-600/20 rounded-full blur-3xl"></div>
      </div>

      <Card ref={cardRef} className="w-full max-w-lg relative z-10 glass-effect concrete-texture border-4 border-success/40 shadow-2xl opacity-0">
        {/* Blueprint corner markers */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-success/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-success/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-success/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-success/60"></div>

        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6 reset-icon opacity-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-success to-green-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <HardHat className="text-white" size={52} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
            </div>
          </div>
          <CardTitle className="reset-title text-5xl font-black mb-2 opacity-0">
            <span className="bg-gradient-to-r from-success via-green-600 to-primary bg-clip-text text-transparent">
              NEW PASSWORD
            </span>
          </CardTitle>
          <CardDescription className="reset-title text-lg font-semibold text-neutral-600 opacity-0">
            Create a New Security Code
          </CardDescription>
          <div className="reset-title flex items-center justify-center gap-2 text-xs text-success font-bold mt-3 opacity-0">
            <span>⚠</span>
            <span>SECURE PASSWORD RESET</span>
            <span>⚠</span>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          {loading ? (
            <div className="py-8">
              <ConstructionLoader text="Resetting Your Password..." />
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-success" size={48} />
              </div>
              <h3 className="text-2xl font-black text-success mb-4">PASSWORD RESET SUCCESSFUL!</h3>
              <p className="text-neutral-700 mb-6 font-medium">
                Your security code has been updated successfully.
              </p>
              <p className="text-sm text-neutral-600 mb-8">
                Redirecting to login page in 3 seconds...
              </p>
              <Link href="/login">
                <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                  GO TO LOGIN NOW
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

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm font-bold flex items-center gap-2 text-neutral-700">
                  <Lock size={18} className="text-success" />
                  NEW SECURITY CODE
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-14 glass-effect border-3 border-success/30 focus:border-success focus:ring-4 focus:ring-success/20 text-lg font-medium"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="confirmPassword" className="text-sm font-bold flex items-center gap-2 text-neutral-700">
                  <ShieldCheck size={18} className="text-success" />
                  CONFIRM SECURITY CODE
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-14 glass-effect border-3 border-success/30 focus:border-success focus:ring-4 focus:ring-success/20 text-lg font-medium"
                />
              </div>

              <MagneticButton
                type="submit"
                className="submit-button w-full h-16 bg-gradient-to-r from-success via-green-600 to-success text-white text-xl font-black shadow-2xl hover:shadow-[0_0_60px_rgba(16,185,129,0.8)] border-2 border-white/30"
                disabled={loading || !token}
              >
                <Lock className="mr-3" size={26} />
                RESET PASSWORD
              </MagneticButton>

              <div className="text-center text-sm text-neutral-600 font-semibold pt-2">
                Remember your password?{' '}
                <Link href="/login" className="text-success font-black hover:text-primary hover:underline transition-colors text-base">
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ConstructionLoader text="Loading..." />}>
      <ResetPasswordForm />
    </Suspense>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import anime from 'animejs'
import { AnimatedButton } from '@/components/ui/animated-button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate card entrance
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        scale: [0.8, 1],
        translateY: [50, 0],
        duration: 1000,
        easing: 'easeOutElastic(1, .8)',
      })
    }

    // Animate floating orbs
    anime({
      targets: '.login-orb',
      translateY: [
        { value: -30, duration: 3000 },
        { value: 0, duration: 3000 }
      ],
      translateX: [
        { value: 20, duration: 2500 },
        { value: -20, duration: 2500 }
      ],
      scale: [
        { value: 1.2, duration: 3000 },
        { value: 1, duration: 3000 }
      ],
      easing: 'easeInOutSine',
      loop: true,
      delay: anime.stagger(500),
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Add loading animation
    anime({
      targets: '.submit-button',
      scale: [1, 0.95, 1],
      duration: 300,
    })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Success animation
      anime({
        targets: cardRef.current,
        scale: [1, 1.05],
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInCubic',
        complete: () => {
          if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      })
    } catch (err: any) {
      setError(err.message)
      // Error shake animation
      anime({
        targets: cardRef.current,
        translateX: [
          { value: -10, duration: 100 },
          { value: 10, duration: 100 },
          { value: -10, duration: 100 },
          { value: 10, duration: 100 },
          { value: 0, duration: 100 },
        ],
        easing: 'easeInOutSine',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-orb absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-3xl"></div>
        <div className="login-orb absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-r from-secondary/30 to-purple-500/30 rounded-full blur-3xl"></div>
        <div className="login-orb absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
      </div>

      <Card ref={cardRef} className="w-full max-w-md relative z-10 glass-effect border-2 shadow-2xl opacity-0">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={40} />
            </div>
          </div>
          <CardTitle className="text-4xl font-bold gradient-text">Absorb LMS</CardTitle>
          <CardDescription className="text-lg">Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-danger/10 border-l-4 border-danger text-danger px-4 py-3 rounded-md text-sm animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 glass-effect border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock size={16} className="text-primary" />
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 glass-effect border-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <AnimatedButton 
              type="submit" 
              className="submit-button w-full h-12 bg-gradient-to-r from-primary to-secondary text-white text-lg font-semibold shadow-lg hover:shadow-xl" 
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </AnimatedButton>

            <div className="text-center text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:text-primary-dark hover:underline transition-colors">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

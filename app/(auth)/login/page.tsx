'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import anime from 'animejs'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ConstructionLoader } from '@/components/ui/construction-loader'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, HardHat, Building2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Epic card entrance with construction theme
    if (cardRef.current) {
      anime.timeline()
        .add({
          targets: cardRef.current,
          opacity: [0, 1],
          scale: [0.7, 1],
          rotateX: [90, 0],
          translateY: [100, 0],
          duration: 1200,
          easing: 'easeOutElastic(1, .7)',
        })
        .add({
          targets: '.login-icon',
          opacity: [0, 1],
          scale: [0, 1],
          rotate: [180, 0],
          duration: 800,
          easing: 'easeOutElastic(1, .6)',
        }, '-=800')
        .add({
          targets: '.login-title',
          opacity: [0, 1],
          translateY: [-20, 0],
          duration: 600,
          easing: 'easeOutCubic',
        }, '-=400')
    }

    // Animate construction-themed floating orbs
    anime({
      targets: '.login-orb',
      translateY: [
        { value: -40, duration: 3500 },
        { value: 0, duration: 3500 }
      ],
      translateX: [
        { value: 30, duration: 3000 },
        { value: -30, duration: 3000 }
      ],
      scale: [
        { value: 1.3, duration: 3500 },
        { value: 1, duration: 3500 }
      ],
      opacity: [
        { value: 0.8, duration: 3000 },
        { value: 0.4, duration: 3000 }
      ],
      easing: 'easeInOutSine',
      loop: true,
      delay: anime.stagger(700),
    })

    // Blueprint grid animation
    anime({
      targets: '.blueprint-line',
      opacity: [0.1, 0.3, 0.1],
      duration: 4000,
      loop: true,
      easing: 'easeInOutSine',
      delay: anime.stagger(200),
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Construction crane loading animation
    anime({
      targets: '.submit-button',
      scale: [1, 0.98, 1],
      duration: 400,
      easing: 'easeInOutCubic',
    })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Access Denied to Construction Site')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Epic success animation - construction site access granted
      anime.timeline({
        complete: () => {
          if (data.user.role === 'ADMIN' || data.user.role === 'SUPER_ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      })
        .add({
          targets: cardRef.current,
          scale: [1, 1.1],
          duration: 300,
          easing: 'easeOutCubic',
        })
        .add({
          targets: cardRef.current,
          scale: [1.1, 0],
          opacity: [1, 0],
          rotateY: [0, 180],
          duration: 600,
          easing: 'easeInCubic',
        })
    } catch (err: any) {
      setError(err.message)
      // Construction warning shake - access denied
      anime({
        targets: cardRef.current,
        translateX: [
          { value: -15, duration: 80 },
          { value: 15, duration: 80 },
          { value: -15, duration: 80 },
          { value: 15, duration: 80 },
          { value: -10, duration: 80 },
          { value: 10, duration: 80 },
          { value: 0, duration: 80 },
        ],
        rotate: [
          { value: -2, duration: 80 },
          { value: 2, duration: 80 },
          { value: -2, duration: 80 },
          { value: 2, duration: 80 },
          { value: 0, duration: 80 },
        ],
        easing: 'easeInOutSine',
      })
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

      {/* Animated Construction-themed Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-orb absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-to-r from-warning/40 to-orange-600/40 rounded-full blur-3xl"></div>
        <div className="login-orb absolute bottom-10 right-10 w-[500px] h-[500px] bg-gradient-to-r from-primary/35 to-blue-600/35 rounded-full blur-3xl"></div>
        <div className="login-orb absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-success/25 to-green-600/25 rounded-full blur-3xl"></div>
      </div>

      {/* Blueprint scanning lines */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="blueprint-line absolute top-0 left-0 w-full h-px bg-primary opacity-20"></div>
        <div className="blueprint-line absolute top-1/4 left-0 w-full h-px bg-warning opacity-20"></div>
        <div className="blueprint-line absolute top-1/2 left-0 w-full h-px bg-success opacity-20"></div>
        <div className="blueprint-line absolute top-3/4 left-0 w-full h-px bg-primary opacity-20"></div>
      </div>

      <Card ref={cardRef} className="w-full max-w-lg relative z-10 glass-effect concrete-texture border-4 border-warning/40 shadow-2xl opacity-0">
        {/* Blueprint corner markers */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

        <CardHeader className="space-y-1 text-center pb-8 pt-10">
          <div className="flex justify-center mb-6 login-icon opacity-0">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-warning to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <HardHat className="text-white" size={52} />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center">
                <ShieldCheck className="text-white" size={18} />
              </div>
            </div>
          </div>
          <CardTitle className="login-title text-5xl font-black mb-2 opacity-0">
            <span className="bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              CIVILABS
            </span>
          </CardTitle>
          <CardDescription className="login-title text-lg font-semibold text-neutral-600 opacity-0">
            Construction Site Access
          </CardDescription>
          <div className="login-title flex items-center justify-center gap-2 text-xs text-warning font-bold mt-3 opacity-0">
            <span>⚠</span>
            <span>AUTHORIZED PERSONNEL ONLY</span>
            <span>⚠</span>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          {loading ? (
            <div className="py-8">
              <ConstructionLoader text="Accessing Construction Site..." />
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
                <label htmlFor="email" className="text-sm font-bold flex items-center gap-2 text-neutral-700">
                  <Mail size={18} className="text-warning" />
                  WORKER EMAIL
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="engineer@civilabs.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-14 glass-effect border-3 border-primary/30 focus:border-warning focus:ring-4 focus:ring-warning/20 text-lg font-medium"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-bold flex items-center gap-2 text-neutral-700">
                    <Lock size={18} className="text-warning" />
                    SECURITY CODE
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-warning hover:underline transition-colors font-semibold"
                  >
                    Lost Access Card?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-14 glass-effect border-3 border-primary/30 focus:border-warning focus:ring-4 focus:ring-warning/20 text-lg font-medium"
                />
              </div>

              <MagneticButton
                type="submit"
                className="submit-button w-full h-16 bg-gradient-to-r from-warning via-primary to-success text-white text-xl font-black shadow-2xl hover:shadow-[0_0_60px_rgba(255,165,0,0.8)] border-2 border-white/30"
                disabled={loading}
              >
                <Building2 className="mr-3" size={26} />
                ENTER CONSTRUCTION SITE
              </MagneticButton>

              <div className="text-center text-sm text-neutral-600 font-semibold pt-2">
                New to the crew?{' '}
                <Link href="/register" className="text-warning font-black hover:text-primary hover:underline transition-colors text-base">
                  JOIN THE TEAM →
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

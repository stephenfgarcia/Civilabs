'use client'

import { useEffect, useRef } from 'react'

export function ConstructionBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Detect performance level - assume low-end by default for best performance
    const checkPerformance = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const cores = navigator.hardwareConcurrency || 2
      // More aggressive detection: treat anything under 8 cores as low-end
      const isLowEnd = cores < 8 || prefersReducedMotion
      return isLowEnd
    }

    const lowPower = checkPerformance()
    if (!canvasRef.current) return

    // Drastically reduce particle count for low-end devices: 3-6 particles max
    const particleCount = lowPower ? 3 : 6
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'construction-particle absolute'

      // Random construction symbols
      const symbols = ['▢', '○', '□']
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)]

      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.fontSize = `${Math.random() * 12 + 8}px`
      particle.style.opacity = `${Math.random() * 0.15 + 0.05}`
      particle.style.color = `hsl(${Math.random() * 60 + 180}, 70%, 60%)`
      particle.style.pointerEvents = 'none'

      // CSS-only animations for all devices (no anime.js)
      particle.style.animation = `float ${Math.random() * 15 + 15}s ease-in-out infinite`
      particle.style.animationDelay = `${Math.random() * 5}s`

      canvasRef.current.appendChild(particle)
      particles.push(particle)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blueprint grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 163, 224, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 163, 224, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Diagonal construction lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(255, 165, 0, 0.5) 100px,
            rgba(255, 165, 0, 0.5) 102px
          )`,
        }}
      />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-warning/20 via-success/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-secondary/20 via-primary/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Particle container */}
      <div ref={canvasRef} className="absolute inset-0" />

      {/* Construction crane silhouette */}
      <div className="absolute bottom-0 right-10 opacity-5">
        <svg width="200" height="400" viewBox="0 0 200 400" fill="currentColor" className="text-neutral-700">
          {/* Crane tower */}
          <rect x="90" y="100" width="20" height="300" />
          {/* Crane arm */}
          <rect x="20" y="95" width="160" height="10" />
          {/* Crane hook line */}
          <line x1="150" y1="105" x2="150" y2="200" stroke="currentColor" strokeWidth="2" />
          {/* Hook */}
          <circle cx="150" cy="205" r="5" />
        </svg>
      </div>
    </div>
  )
}

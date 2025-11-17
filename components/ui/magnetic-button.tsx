'use client'

import { useRef, useState, useEffect } from 'react'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils/cn'

export function MagneticButton({ children, className, ...props }: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isLowPower, setIsLowPower] = useState(true) // Default to low-power for best performance

  useEffect(() => {
    // Detect performance level - aggressive low-end detection
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cores = navigator.hardwareConcurrency || 2
    // Treat anything under 8 cores as low-end
    setIsLowPower(cores < 8 || prefersReducedMotion)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Disable magnetic effect on all devices for best performance
    if (!buttonRef.current || isLowPower) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Very subtle magnetic effect only on high-end devices
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = 80

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance
      const pullX = x * strength * 0.1
      const pullY = y * strength * 0.1

      buttonRef.current.style.transform = `translate(${pullX}px, ${pullY}px)`
      buttonRef.current.style.transition = 'transform 0.15s ease-out'
    }
  }

  const handleMouseEnter = () => {
    // Simple CSS hover effect only
    if (!buttonRef.current) return
    buttonRef.current.classList.add('hover:scale-105')
  }

  const handleMouseLeave = () => {
    if (!buttonRef.current) return
    buttonRef.current.style.transform = 'translate(0, 0) scale(1)'
    buttonRef.current.style.transition = 'transform 0.2s ease-out'
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Simple CSS press effect
    if (buttonRef.current) {
      buttonRef.current.style.transform = 'scale(0.98)'
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.style.transform = 'scale(1)'
        }
      }, 100)
    }

    props.onClick?.(e)
  }

  return (
    <Button
      ref={buttonRef}
      className={cn('relative overflow-hidden will-change-transform transition-all duration-200', className)}
      onMouseMove={isLowPower ? undefined : handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      {...props}
    >
      {/* Construction-inspired corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-current opacity-50" />
      <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-current opacity-50" />
      <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-current opacity-50" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-current opacity-50" />

      {children}
    </Button>
  )
}

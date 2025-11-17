'use client'

import { useRef, useState, useEffect } from 'react'
import anime from 'animejs'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils/cn'

export function MagneticButton({ children, className, ...props }: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isLowPower, setIsLowPower] = useState(false)

  useEffect(() => {
    // Detect performance level
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cores = navigator.hardwareConcurrency || 4
    setIsLowPower(cores < 4 || prefersReducedMotion)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current || isLowPower) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Magnetic pull effect - reduced distance for better performance
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = 100 // Reduced from 150

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance
      const pullX = x * strength * 0.2 // Reduced from 0.3
      const pullY = y * strength * 0.2

      // Use CSS transforms directly instead of anime.js for better performance
      buttonRef.current.style.transform = `translate(${pullX}px, ${pullY}px) scale(${1 + strength * 0.05})`
      buttonRef.current.style.transition = 'transform 0.2s ease-out'
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (!buttonRef.current || isLowPower) return

    // Simplified glow effect
    if (!isLowPower) {
      anime({
        targets: buttonRef.current,
        boxShadow: [
          '0 0 0px rgba(0, 163, 224, 0)',
          '0 0 20px rgba(0, 163, 224, 0.4), 0 0 40px rgba(107, 72, 255, 0.3)', // Reduced intensity
        ],
        duration: 300, // Faster
        easing: 'easeOutCubic',
      })
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!buttonRef.current) return

    if (isLowPower) {
      // Simple CSS transition for low-power
      buttonRef.current.style.transform = 'translate(0, 0) scale(1)'
      buttonRef.current.style.transition = 'transform 0.3s ease-out'
    } else {
      // Simplified animation
      anime({
        targets: buttonRef.current,
        translateX: 0,
        translateY: 0,
        scale: 1,
        boxShadow: '0 0 0px rgba(0, 163, 224, 0)',
        duration: 400, // Reduced from 500
        easing: 'easeOutCubic', // Simpler easing
      })
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isLowPower) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Simplified ripple effect
      const ripple = document.createElement('span')
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255,255,255,0.5);
        transform: translate(-50%, -50%);
        pointer-events: none;
      `
      e.currentTarget.appendChild(ripple)

      anime({
        targets: ripple,
        width: 300, // Reduced from 400
        height: 300,
        opacity: [1, 0],
        duration: 600, // Faster
        easing: 'easeOutCubic', // Simpler easing
        complete: () => ripple.remove(),
      })

      // Simplified button press animation
      anime.timeline()
        .add({
          targets: buttonRef.current,
          scale: 0.96,
          duration: 80,
          easing: 'easeInCubic',
        })
        .add({
          targets: buttonRef.current,
          scale: 1,
          duration: 150,
          easing: 'easeOutCubic',
        })
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

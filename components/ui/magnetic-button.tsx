'use client'

import { useRef, useState } from 'react'
import anime from 'animejs'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils/cn'

export function MagneticButton({ children, className, ...props }: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Magnetic pull effect
    const distance = Math.sqrt(x * x + y * y)
    const maxDistance = 150

    if (distance < maxDistance) {
      const strength = 1 - distance / maxDistance
      const pullX = x * strength * 0.3
      const pullY = y * strength * 0.3

      anime({
        targets: buttonRef.current,
        translateX: pullX,
        translateY: pullY,
        scale: 1 + strength * 0.1,
        duration: 300,
        easing: 'easeOutCubic',
      })
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (!buttonRef.current) return

    // Glow effect on hover
    anime({
      targets: buttonRef.current,
      boxShadow: [
        '0 0 0px rgba(0, 163, 224, 0)',
        '0 0 30px rgba(0, 163, 224, 0.6), 0 0 60px rgba(107, 72, 255, 0.4)',
      ],
      duration: 400,
      easing: 'easeOutCubic',
    })
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!buttonRef.current) return

    anime({
      targets: buttonRef.current,
      translateX: 0,
      translateY: 0,
      scale: 1,
      boxShadow: '0 0 0px rgba(0, 163, 224, 0)',
      duration: 500,
      easing: 'easeOutElastic(1, .6)',
    })
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Ripple effect
    const ripple = document.createElement('span')
    ripple.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: translate(-50%, -50%);
      pointer-events: none;
    `
    e.currentTarget.appendChild(ripple)

    anime({
      targets: ripple,
      width: 400,
      height: 400,
      opacity: [1, 0],
      duration: 800,
      easing: 'easeOutExpo',
      complete: () => ripple.remove(),
    })

    // Button press animation
    anime.timeline()
      .add({
        targets: buttonRef.current,
        scale: 0.95,
        duration: 100,
        easing: 'easeInCubic',
      })
      .add({
        targets: buttonRef.current,
        scale: isHovering ? 1.1 : 1,
        duration: 200,
        easing: 'easeOutElastic(1, .8)',
      })

    props.onClick?.(e)
  }

  return (
    <Button
      ref={buttonRef}
      className={cn('relative overflow-hidden transition-all duration-300', className)}
      onMouseMove={handleMouseMove}
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

'use client'

import { useRef } from 'react'
import anime from 'animejs'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils/cn'

export function AnimatedButton({ children, className, ...props }: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

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
      width: 300,
      height: 300,
      opacity: [1, 0],
      duration: 800,
      easing: 'easeOutExpo',
      complete: () => ripple.remove(),
    })

    props.onClick?.(e)
  }

  return (
    <Button
      ref={buttonRef}
      className={cn('relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  )
}

'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  className?: string
  children: React.ReactNode
  onClose?: () => void
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {/* Content */}
      {children}
    </div>
  )
}

export function DialogContent({ className, children, onClose }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto glass-effect concrete-texture border-4 border-primary/40 rounded-xl shadow-2xl',
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full glass-effect border-2 border-danger/30 flex items-center justify-center hover:border-danger hover:bg-danger/10 transition-all"
        >
          <X size={20} className="text-danger" />
        </button>
      )}
    </div>
  )
}

export function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 pb-4', className)}>{children}</div>
}

export function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-2xl font-black text-neutral-800', className)}>{children}</h2>
}

export function DialogDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('text-sm text-neutral-600 font-semibold mt-2', className)}>{children}</p>
}

export function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-6 pt-4 flex justify-end gap-3', className)}>{children}</div>
}

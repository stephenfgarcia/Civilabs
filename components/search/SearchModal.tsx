'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import GlobalSearch from './GlobalSearch'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-gray-50 rounded-lg shadow-2xl p-6 max-h-[80vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded-lg transition-colors z-10"
          aria-label="Close search"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Search Component */}
        <GlobalSearch onClose={onClose} autoFocus />

        {/* Keyboard Hint */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-700 font-mono">
            ESC
          </kbd>{' '}
          to close
        </div>
      </div>
    </div>
  )
}

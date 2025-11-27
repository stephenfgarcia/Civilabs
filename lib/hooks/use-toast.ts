import { useState, useCallback } from 'react'

interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

let globalToastFn: ((toast: Toast) => void) | null = null

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)

  const showToast = useCallback((toastData: Toast) => {
    setToast(toastData)
    // Auto-dismiss after 3 seconds
    setTimeout(() => setToast(null), 3000)

    // Show browser notification
    if (toastData.variant === 'destructive') {
      alert(`Error: ${toastData.title}\n${toastData.description || ''}`)
    } else {
      console.log(`Success: ${toastData.title}`, toastData.description)
    }
  }, [])

  // Register global toast function
  if (!globalToastFn) {
    globalToastFn = showToast
  }

  return {
    toast: showToast,
    currentToast: toast,
  }
}

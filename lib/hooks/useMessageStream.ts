import { useEffect, useRef, useState, useCallback } from 'react'

// Match the Message type from messages.service.ts
interface StreamMessage {
  id: string
  conversationId: string
  senderId: string
  content: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  createdAt: Date | string
  updatedAt?: Date | string
  sender: {
    id: string
    firstName: string
    lastName: string
    email?: string
    avatarUrl: string | null
    role?: string
  }
}

interface UseMessageStreamOptions {
  conversationId: string | null
  onNewMessages?: (messages: any[]) => void
  onError?: (error: string) => void
}

/**
 * Custom hook for real-time message streaming using Server-Sent Events (SSE)
 *
 * Replaces the old 15-second polling with a persistent connection
 * that receives updates immediately when new messages arrive.
 */
export function useMessageStream(options: UseMessageStreamOptions) {
  const { conversationId, onNewMessages, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!conversationId) return

    // Close existing connection if any
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    try {
      const url = `/api/messages/stream?conversationId=${conversationId}`
      const eventSource = new EventSource(url)

      eventSource.onopen = () => {
        console.log('[MessageStream] Connected to conversation:', conversationId)
        setIsConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'connected') {
            console.log('[MessageStream] Stream initialized for conversation:', data.conversationId)
          } else if (data.type === 'messages' && data.messages) {
            console.log('[MessageStream] Received new messages:', data.messages.length)
            onNewMessages?.(data.messages)
          } else if (data.type === 'error') {
            console.error('[MessageStream] Server error:', data.message)
            onError?.(data.message)
          }
        } catch (error) {
          console.error('[MessageStream] Failed to parse event data:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('[MessageStream] Connection error:', error)
        setIsConnected(false)

        // EventSource automatically reconnects, but we can handle errors here
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('[MessageStream] Connection closed, will retry...')
          onError?.('Connection lost, reconnecting...')
        }
      }

      eventSourceRef.current = eventSource
    } catch (error) {
      console.error('[MessageStream] Failed to create connection:', error)
      setIsConnected(false)
      onError?.('Failed to establish connection')
    }
  }, [conversationId, onNewMessages, onError])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      console.log('[MessageStream] Disconnecting...')
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsConnected(false)
    }
  }, [])

  // Connect when conversationId changes
  useEffect(() => {
    if (conversationId) {
      connect()
    }

    // Cleanup on unmount or when conversationId changes
    return () => {
      disconnect()
    }
  }, [conversationId, connect, disconnect])

  return {
    isConnected,
    disconnect,
    reconnect: connect,
  }
}

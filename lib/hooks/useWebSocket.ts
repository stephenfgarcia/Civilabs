import { useEffect, useRef, useState, useCallback } from 'react'

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
  reconnectInterval?: number
  maxReconnectAttempts?: number
}

interface WebSocketHook {
  isConnected: boolean
  sendMessage: (data: any) => void
  disconnect: () => void
  reconnect: () => void
}

/**
 * Custom hook for WebSocket connections with automatic reconnection
 *
 * @param url - WebSocket URL to connect to
 * @param options - Configuration options for the WebSocket connection
 * @returns Object with connection state and control methods
 */
export function useWebSocket(
  url: string | null,
  options: UseWebSocketOptions = {}
): WebSocketHook {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldReconnectRef = useRef(true)

  const connect = useCallback(() => {
    if (!url || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close()
      }

      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('[WebSocket] Connected to:', url)
        setIsConnected(true)
        reconnectAttemptsRef.current = 0
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
        onError?.(error)
      }

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected from:', url)
        setIsConnected(false)
        onDisconnect?.()

        // Attempt reconnection if enabled and under max attempts
        if (
          shouldReconnectRef.current &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current += 1
          console.log(
            `[WebSocket] Reconnecting... (Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, reconnectInterval)
        }
      }

      wsRef.current = ws
    } catch (error) {
      console.error('[WebSocket] Connection error:', error)
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts])

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    setIsConnected(false)
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    shouldReconnectRef.current = true
    reconnectAttemptsRef.current = 0
    connect()
  }, [connect, disconnect])

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data))
      } catch (error) {
        console.error('[WebSocket] Failed to send message:', error)
      }
    } else {
      console.warn('[WebSocket] Cannot send message - not connected')
    }
  }, [])

  // Connect on mount
  useEffect(() => {
    if (url) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      shouldReconnectRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [url, connect])

  return {
    isConnected,
    sendMessage,
    disconnect,
    reconnect,
  }
}

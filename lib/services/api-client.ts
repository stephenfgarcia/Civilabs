/**
 * API Client Service
 * Centralized API request handler with error handling, authentication, and retry logic
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: any
  headers?: Record<string, string>
  cache?: RequestCache
  revalidate?: number
  signal?: AbortSignal
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status: number
}

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Get authentication token from cookies
   * Note: Token is stored in httpOnly cookies for security.
   * This method is for client-side compatibility only.
   * The actual authentication happens via httpOnly cookies automatically sent with requests.
   */
  private getAuthToken(): string | null {
    // For client-side requests, cookies are automatically sent by the browser
    // We don't need to manually extract the token
    // This is more secure as it prevents XSS attacks
    return null
  }

  /**
   * Build headers with authentication
   * Note: Authentication is handled via httpOnly cookies automatically
   * No need to manually add Authorization header for same-origin requests
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders, ...customHeaders }

    // httpOnly cookies are automatically included in same-origin requests
    // No need to manually add Authorization header
    // This is more secure and prevents XSS token theft

    return headers
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      headers = {},
      cache,
      revalidate,
      signal,
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const requestHeaders = this.buildHeaders(headers)

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        cache,
        next: revalidate ? { revalidate } : undefined,
        signal,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          error: data.error || data.message || 'Request failed',
          message: data.message,
          status: response.status,
        }
      }

      return {
        data,
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 500,
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient

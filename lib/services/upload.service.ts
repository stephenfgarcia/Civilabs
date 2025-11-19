/**
 * Upload Service
 * Handles file uploads for lesson content and other assets
 */

export interface UploadResponse {
  success: boolean
  data?: {
    url: string
    filename: string
    originalName: string
    size: number
    type: string
    uploadedAt: string
  }
  error?: string
  message?: string
}

export type FileType = 'video' | 'document' | 'image' | 'scorm'

class UploadService {
  private baseUrl = '/api'

  /**
   * Upload a file
   */
  async uploadFile(file: File, type?: FileType): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (type) {
        formData.append('type', type)
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Upload failed',
          message: data.message,
        }
      }

      return data
    } catch (error) {
      console.error('Error uploading file:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
      }
    }
  }

  /**
   * Upload lesson content (video, document, or SCORM)
   */
  async uploadLessonContent(file: File, contentType: 'VIDEO' | 'DOCUMENT' | 'SCORM'): Promise<UploadResponse> {
    const typeMap: Record<string, FileType> = {
      VIDEO: 'video',
      DOCUMENT: 'document',
      SCORM: 'scorm',
    }

    return this.uploadFile(file, typeMap[contentType])
  }

  /**
   * Upload course thumbnail
   */
  async uploadThumbnail(file: File): Promise<UploadResponse> {
    return this.uploadFile(file, 'image')
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    options: {
      maxSize?: number // in bytes
      allowedTypes?: string[]
      allowedExtensions?: string[]
    } = {}
  ): { valid: boolean; error?: string } {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = [],
      allowedExtensions = [],
    } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${this.formatFileSize(maxSize)}`,
      }
    }

    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type "${file.type}" is not allowed`,
      }
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File extension ".${extension}" is not allowed`,
        }
      }
    }

    return { valid: true }
  }

  /**
   * Get allowed file types for content type
   */
  getAllowedFileTypes(contentType: 'VIDEO' | 'DOCUMENT' | 'SCORM' | 'IMAGE'): {
    mimeTypes: string[]
    extensions: string[]
    maxSize: number
  } {
    const configs = {
      VIDEO: {
        mimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
        extensions: ['mp4', 'webm', 'ogg', 'mov'],
        maxSize: 500 * 1024 * 1024, // 500MB
      },
      DOCUMENT: {
        mimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
        ],
        extensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'],
        maxSize: 50 * 1024 * 1024, // 50MB
      },
      SCORM: {
        mimeTypes: ['application/zip', 'application/x-zip-compressed'],
        extensions: ['zip'],
        maxSize: 200 * 1024 * 1024, // 200MB
      },
      IMAGE: {
        mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        maxSize: 5 * 1024 * 1024, // 5MB
      },
    }

    return configs[contentType]
  }

  /**
   * Format file size in human-readable format
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Get file extension from filename or URL
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  /**
   * Get content type from file extension
   */
  getContentTypeFromExtension(extension: string): 'VIDEO' | 'DOCUMENT' | 'SCORM' | 'IMAGE' | null {
    const ext = extension.toLowerCase()

    if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) {
      return 'VIDEO'
    }
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt'].includes(ext)) {
      return 'DOCUMENT'
    }
    if (ext === 'zip') {
      return 'SCORM'
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return 'IMAGE'
    }

    return null
  }

  /**
   * Validate video file
   */
  validateVideo(file: File): { valid: boolean; error?: string } {
    const config = this.getAllowedFileTypes('VIDEO')
    return this.validateFile(file, {
      maxSize: config.maxSize,
      allowedTypes: config.mimeTypes,
      allowedExtensions: config.extensions,
    })
  }

  /**
   * Validate document file
   */
  validateDocument(file: File): { valid: boolean; error?: string } {
    const config = this.getAllowedFileTypes('DOCUMENT')
    return this.validateFile(file, {
      maxSize: config.maxSize,
      allowedTypes: config.mimeTypes,
      allowedExtensions: config.extensions,
    })
  }

  /**
   * Validate SCORM package
   */
  validateScorm(file: File): { valid: boolean; error?: string } {
    const config = this.getAllowedFileTypes('SCORM')
    return this.validateFile(file, {
      maxSize: config.maxSize,
      allowedTypes: config.mimeTypes,
      allowedExtensions: config.extensions,
    })
  }

  /**
   * Validate image file
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const config = this.getAllowedFileTypes('IMAGE')
    return this.validateFile(file, {
      maxSize: config.maxSize,
      allowedTypes: config.mimeTypes,
      allowedExtensions: config.extensions,
    })
  }
}

export const uploadService = new UploadService()
export default uploadService

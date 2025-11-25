/**
 * Media API Service
 * Handles media file uploads
 */

import { apiClient } from './api-client'

export interface MediaUploadResponse {
  url: string
  filename: string
  size: number
  type: string
}

class MediaService {
  /**
   * Upload media file
   */
  async uploadMedia(file: File, type?: 'image' | 'video' | 'document'): Promise<MediaUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    if (type) {
      formData.append('type', type)
    }

    const response = await apiClient.post<MediaUploadResponse>('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data!
  }

  /**
   * Upload multiple media files
   */
  async uploadMultipleMedia(
    files: File[],
    type?: 'image' | 'video' | 'document'
  ): Promise<MediaUploadResponse[]> {
    const uploads = files.map((file) => this.uploadMedia(file, type))
    return Promise.all(uploads)
  }
}

export const mediaService = new MediaService()
export default mediaService

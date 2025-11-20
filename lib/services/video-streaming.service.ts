/**
 * Video Streaming Service
 * Handles video content delivery, streaming optimization, and playback features
 */

export interface VideoMetadata {
  duration: number // in seconds
  width: number
  height: number
  bitrate?: number
  codec?: string
  fileSize: number
  format: string
}

export interface VideoQuality {
  label: string // "360p", "480p", "720p", "1080p"
  resolution: { width: number; height: number }
  bitrate: number // kbps
  url: string
}

export interface VideoStreamingOptions {
  enableAdaptive: boolean
  defaultQuality: string
  autoplay: boolean
  preload: 'none' | 'metadata' | 'auto'
  playbackRates: number[]
  enableCaptions: boolean
  enableDownload: boolean
}

class VideoStreamingService {
  /**
   * Get video player configuration
   */
  getPlayerConfig(options: Partial<VideoStreamingOptions> = {}): VideoStreamingOptions {
    return {
      enableAdaptive: options.enableAdaptive ?? true,
      defaultQuality: options.defaultQuality ?? '720p',
      autoplay: options.autoplay ?? false,
      preload: options.preload ?? 'metadata',
      playbackRates: options.playbackRates ?? [0.5, 0.75, 1, 1.25, 1.5, 2],
      enableCaptions: options.enableCaptions ?? true,
      enableDownload: options.enableDownload ?? false,
    }
  }

  /**
   * Generate HLS (HTTP Live Streaming) playlist URL
   * For production, this would point to a CDN or streaming service
   */
  getHLSUrl(videoId: string): string {
    return `/api/video/stream/${videoId}/playlist.m3u8`
  }

  /**
   * Generate DASH (Dynamic Adaptive Streaming over HTTP) manifest URL
   * For production, this would point to a CDN or streaming service
   */
  getDASHUrl(videoId: string): string {
    return `/api/video/stream/${videoId}/manifest.mpd`
  }

  /**
   * Get direct video URL (for simple playback)
   */
  getDirectUrl(videoPath: string): string {
    // If video is stored locally
    if (videoPath.startsWith('/uploads')) {
      return videoPath
    }
    // If video is from external source
    return videoPath
  }

  /**
   * Get video thumbnail URL
   */
  getThumbnailUrl(videoPath: string, timeOffset: number = 0): string {
    // Generate thumbnail from video at specific time
    // In production, this would be pre-generated or use a service
    return `/api/video/thumbnail?video=${encodeURIComponent(videoPath)}&time=${timeOffset}`
  }

  /**
   * Calculate video quality based on file size and duration
   */
  estimateQuality(fileSize: number, duration: number): string {
    // Rough estimation based on bitrate
    const bitrate = (fileSize * 8) / duration / 1000 // kbps

    if (bitrate >= 5000) return '1080p'
    if (bitrate >= 2500) return '720p'
    if (bitrate >= 1000) return '480p'
    return '360p'
  }

  /**
   * Get recommended video quality based on network speed
   * @param speedMbps Network speed in Mbps
   */
  getRecommendedQuality(speedMbps: number): string {
    if (speedMbps >= 5) return '1080p'
    if (speedMbps >= 3) return '720p'
    if (speedMbps >= 1.5) return '480p'
    return '360p'
  }

  /**
   * Format duration from seconds to HH:MM:SS
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    const parts = []
    if (hours > 0) parts.push(hours.toString().padStart(2, '0'))
    parts.push(minutes.toString().padStart(2, '0'))
    parts.push(secs.toString().padStart(2, '0'))

    return parts.join(':')
  }

  /**
   * Parse time string (HH:MM:SS) to seconds
   */
  parseTimeToSeconds(timeString: string): number {
    const parts = timeString.split(':').map(Number)
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]
    } else if (parts.length === 2) {
      return parts[0] * 60 + parts[1]
    }
    return parts[0]
  }

  /**
   * Calculate video buffer size based on quality
   */
  getBufferSize(quality: string): { min: number; max: number } {
    const bufferSizes: Record<string, { min: number; max: number }> = {
      '1080p': { min: 30, max: 60 },
      '720p': { min: 20, max: 40 },
      '480p': { min: 15, max: 30 },
      '360p': { min: 10, max: 20 },
    }
    return bufferSizes[quality] || { min: 15, max: 30 }
  }

  /**
   * Check if video format is supported by HTML5 video
   */
  isFormatSupported(format: string): boolean {
    const supportedFormats = ['mp4', 'webm', 'ogg']
    return supportedFormats.includes(format.toLowerCase())
  }

  /**
   * Get video MIME type
   */
  getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      m3u8: 'application/x-mpegURL',
      mpd: 'application/dash+xml',
    }
    return mimeTypes[format.toLowerCase()] || 'video/mp4'
  }

  /**
   * Generate video chapters/markers
   */
  createChapters(timestamps: Array<{ time: number; title: string; description?: string }>) {
    return timestamps.map((chapter) => ({
      ...chapter,
      formattedTime: this.formatDuration(chapter.time),
    }))
  }

  /**
   * Calculate video completion percentage
   */
  calculateCompletionPercentage(currentTime: number, duration: number): number {
    if (duration === 0) return 0
    return Math.min(Math.round((currentTime / duration) * 100), 100)
  }

  /**
   * Determine if video has been watched (>90% completion)
   */
  isVideoWatched(currentTime: number, duration: number): boolean {
    return this.calculateCompletionPercentage(currentTime, duration) >= 90
  }

  /**
   * Get video playback speed label
   */
  getSpeedLabel(speed: number): string {
    if (speed === 1) return 'Normal'
    if (speed < 1) return `${speed}x (Slow)`
    return `${speed}x (Fast)`
  }

  /**
   * Generate VTT (WebVTT) captions URL
   */
  getCaptionsUrl(videoId: string, language: string = 'en'): string {
    return `/api/video/captions/${videoId}/${language}.vtt`
  }

  /**
   * Check if video should be marked as completed
   * Requires >90% watched OR explicit completion
   */
  shouldMarkComplete(watchedPercentage: number, userMarkedComplete: boolean = false): boolean {
    return watchedPercentage >= 90 || userMarkedComplete
  }

  /**
   * Calculate estimated data usage for video playback
   * @param durationMinutes Video duration in minutes
   * @param quality Video quality
   * @returns Estimated data usage in MB
   */
  estimateDataUsage(durationMinutes: number, quality: string): number {
    const bitrateMap: Record<string, number> = {
      '1080p': 5000, // 5 Mbps
      '720p': 2500, // 2.5 Mbps
      '480p': 1000, // 1 Mbps
      '360p': 500, // 0.5 Mbps
    }

    const bitrate = bitrateMap[quality] || 1000
    // (bitrate in kbps * duration in seconds) / 8 / 1024 = MB
    return Math.round((bitrate * durationMinutes * 60) / 8 / 1024)
  }

  /**
   * Get CDN URL for video (for production)
   * This would integrate with services like Cloudflare Stream, AWS CloudFront, etc.
   */
  getCDNUrl(videoPath: string, cdnDomain?: string): string {
    if (!cdnDomain) {
      return this.getDirectUrl(videoPath)
    }
    // Strip leading slash if present
    const cleanPath = videoPath.startsWith('/') ? videoPath.substring(1) : videoPath
    return `https://${cdnDomain}/${cleanPath}`
  }

  /**
   * Generate signed URL for protected video content
   * In production, this would create a time-limited signed URL
   */
  generateSignedUrl(videoPath: string, expiresIn: number = 3600): string {
    // Placeholder implementation
    // In production, use HMAC or similar signing mechanism
    const timestamp = Date.now() + expiresIn * 1000
    return `${this.getDirectUrl(videoPath)}?expires=${timestamp}`
  }
}

export const videoStreamingService = new VideoStreamingService()
export default videoStreamingService

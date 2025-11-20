/**
 * File Storage Utilities
 * Handles file storage optimization, cleanup, and management
 */

import { promises as fs } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

export interface StorageStats {
  totalFiles: number
  totalSize: number // in bytes
  byType: Record<string, { count: number; size: number }>
  oldestFile?: { path: string; date: Date }
  largestFile?: { path: string; size: number }
}

export interface CleanupOptions {
  olderThanDays?: number
  fileTypes?: string[]
  minSizeBytes?: number
  dryRun?: boolean
}

export interface CleanupResult {
  filesDeleted: number
  spaceFree: number // in bytes
  errors: string[]
}

class FileStorageManager {
  private readonly uploadsDir = join(process.cwd(), 'public', 'uploads')

  /**
   * Get storage statistics
   */
  async getStorageStats(directory: string = this.uploadsDir): Promise<StorageStats> {
    const stats: StorageStats = {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
    }

    if (!existsSync(directory)) {
      return stats
    }

    try {
      const files = await this.getAllFiles(directory)

      for (const file of files) {
        const fileStats = await fs.stat(file)
        const ext = this.getFileExtension(file).toLowerCase()

        stats.totalFiles++
        stats.totalSize += fileStats.size

        if (!stats.byType[ext]) {
          stats.byType[ext] = { count: 0, size: 0 }
        }
        stats.byType[ext].count++
        stats.byType[ext].size += fileStats.size

        // Track oldest file
        if (!stats.oldestFile || fileStats.mtime < stats.oldestFile.date) {
          stats.oldestFile = { path: file, date: fileStats.mtime }
        }

        // Track largest file
        if (!stats.largestFile || fileStats.size > stats.largestFile.size) {
          stats.largestFile = { path: file, size: fileStats.size }
        }
      }
    } catch (error) {
      console.error('Error getting storage stats:', error)
    }

    return stats
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFiles(directory: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(directory, entry.name)

        if (entry.isDirectory()) {
          files.push(...(await this.getAllFiles(fullPath)))
        } else {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${directory}:`, error)
    }

    return files
  }

  /**
   * Clean up old or unused files
   */
  async cleanup(options: CleanupOptions = {}): Promise<CleanupResult> {
    const result: CleanupResult = {
      filesDeleted: 0,
      spaceFreed: 0,
      errors: [],
    }

    const {
      olderThanDays = 90,
      fileTypes = [],
      minSizeBytes = 0,
      dryRun = false,
    } = options

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    try {
      const files = await this.getAllFiles(this.uploadsDir)

      for (const file of files) {
        try {
          const fileStats = await fs.stat(file)
          const ext = this.getFileExtension(file).toLowerCase()

          // Check if file meets deletion criteria
          const isOldEnough = fileStats.mtime < cutoffDate
          const matchesType = fileTypes.length === 0 || fileTypes.includes(ext)
          const meetsMinSize = fileStats.size >= minSizeBytes

          if (isOldEnough && matchesType && meetsMinSize) {
            if (!dryRun) {
              await fs.unlink(file)
            }
            result.filesDeleted++
            result.spaceFreed += fileStats.size
          }
        } catch (error) {
          result.errors.push(`Error processing ${file}: ${error}`)
        }
      }

      // Clean up empty directories
      if (!dryRun) {
        await this.cleanupEmptyDirectories(this.uploadsDir)
      }
    } catch (error) {
      result.errors.push(`Cleanup error: ${error}`)
    }

    return result
  }

  /**
   * Remove empty directories recursively
   */
  private async cleanupEmptyDirectories(directory: string): Promise<void> {
    try {
      const entries = await fs.readdir(directory, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = join(directory, entry.name)
          await this.cleanupEmptyDirectories(fullPath)

          // Try to remove directory if it's empty
          try {
            const dirEntries = await fs.readdir(fullPath)
            if (dirEntries.length === 0) {
              await fs.rmdir(fullPath)
            }
          } catch (error) {
            // Directory not empty or error, ignore
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Format bytes to human-readable size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || ''
  }

  /**
   * Check if file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  /**
   * Delete file
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      await fs.unlink(filePath)
      return true
    } catch (error) {
      console.error(`Error deleting file ${filePath}:`, error)
      return false
    }
  }

  /**
   * Delete multiple files
   */
  async deleteFiles(filePaths: string[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0
    let failed = 0

    for (const filePath of filePaths) {
      const success = await this.deleteFile(filePath)
      if (success) {
        deleted++
      } else {
        failed++
      }
    }

    return { deleted, failed }
  }

  /**
   * Get disk usage summary
   */
  async getDiskUsageSummary(): Promise<{
    total: string
    byType: Record<string, string>
    largestFiles: Array<{ path: string; size: string }>
  }> {
    const stats = await this.getStorageStats()

    return {
      total: this.formatFileSize(stats.totalSize),
      byType: Object.fromEntries(
        Object.entries(stats.byType).map(([type, data]) => [
          type,
          this.formatFileSize(data.size),
        ])
      ),
      largestFiles: stats.largestFile
        ? [
            {
              path: stats.largestFile.path,
              size: this.formatFileSize(stats.largestFile.size),
            },
          ]
        : [],
    }
  }

  /**
   * Optimize file storage (compress images, remove duplicates, etc.)
   * This is a placeholder for future implementation
   */
  async optimize(): Promise<{ optimized: number; spaceSaved: number }> {
    // TODO: Implement image compression
    // TODO: Implement duplicate file detection
    // TODO: Implement unused file detection
    return { optimized: 0, spaceSaved: 0 }
  }

  /**
   * Find orphaned files (files not referenced in database)
   * This would require database integration
   */
  async findOrphanedFiles(): Promise<string[]> {
    // TODO: Query database for all file references
    // TODO: Compare with actual files in storage
    // TODO: Return list of orphaned files
    return []
  }

  /**
   * Generate storage report
   */
  async generateReport(): Promise<string> {
    const stats = await getStorageStats()
    const summary = await this.getDiskUsageSummary()

    let report = '=== Storage Report ===\n\n'
    report += `Total Files: ${stats.totalFiles}\n`
    report += `Total Size: ${summary.total}\n\n`

    report += 'By File Type:\n'
    for (const [type, size] of Object.entries(summary.byType)) {
      const count = stats.byType[type]?.count || 0
      report += `  ${type}: ${count} files (${size})\n`
    }

    if (stats.oldestFile) {
      report += `\nOldest File: ${stats.oldestFile.path}\n`
      report += `  Date: ${stats.oldestFile.date.toLocaleString()}\n`
    }

    if (stats.largestFile) {
      report += `\nLargest File: ${stats.largestFile.path}\n`
      report += `  Size: ${this.formatFileSize(stats.largestFile.size)}\n`
    }

    return report
  }
}

export const fileStorageManager = new FileStorageManager()

// Export standalone functions for convenience
export const getStorageStats = () => fileStorageManager.getStorageStats()
export const cleanup = (options?: CleanupOptions) => fileStorageManager.cleanup(options)
export const formatFileSize = (bytes: number) => fileStorageManager.formatFileSize(bytes)
export const getDiskUsageSummary = () => fileStorageManager.getDiskUsageSummary()

export default fileStorageManager

'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/hooks'
import { mediaService } from '@/lib/services'
import {
  Files,
  Upload,
  Search,
  Filter,
  FileVideo,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
  Download,
  Eye,
  Clock,
  HardDrive,
  CheckCircle,
  MoreVertical,
  Loader2,
} from 'lucide-react'

interface ContentFile {
  id: string
  name: string
  type: 'video' | 'document' | 'image' | 'other'
  size: string
  sizeBytes: number
  uploadDate: string
  path: string
}

const FILE_TYPES = ['All', 'Videos', 'Documents', 'Images', 'Other']

export default function ContentPage() {
  const [files, setFiles] = useState<ContentFile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [mediaStats, setMediaStats] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMediaData()
  }, [])

  useEffect(() => {
    if (!loading) {
      const elements = document.querySelectorAll('.admin-item')
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
      })
    }
  }, [loading])

  const fetchMediaData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/media/files')
      const data = await response.json()

      if (data.success && data.data) {
        setFiles(data.data.files || [])
        setMediaStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: 'Error',
        description: 'Failed to load media files',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    try {
      setUploading(true)

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const result = await mediaService.uploadMedia(file)

        toast({
          title: 'Success',
          description: `${file.name} uploaded successfully`
        })
      }

      // Refresh media data after upload
      fetchMediaData()

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return
    }

    try {
      // Call mediaService delete or API directly
      const response = await fetch(`/api/media/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        toast({
          title: 'File Deleted',
          description: `${fileName} has been removed successfully`,
        })
        // Refresh the file list
        fetchMediaData()
      } else {
        throw new Error('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: 'Delete Failed',
        description: error instanceof Error ? error.message : 'Could not delete file',
        variant: 'destructive',
      })
    }
  }

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase())

    let matchesType = selectedType === 'All'
    if (selectedType === 'Videos') matchesType = file.type === 'video'
    if (selectedType === 'Documents') matchesType = file.type === 'document'
    if (selectedType === 'Images') matchesType = file.type === 'image'
    if (selectedType === 'Other') matchesType = file.type === 'other'

    return matchesSearch && matchesType
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video':
        return FileVideo
      case 'document':
        return FileText
      case 'image':
        return ImageIcon
      default:
        return File
    }
  }

  const getFileColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'from-danger to-red-600'
      case 'document':
        return 'from-primary to-blue-600'
      case 'image':
        return 'from-success to-green-600'
      default:
        return 'from-neutral-400 to-neutral-600'
    }
  }

  const totalSize = '1.2 TB'
  const usedSize = mediaStats?.totalSize || '0 Bytes'
  const totalFiles = mediaStats?.totalFiles || files.length
  const usagePercentage = Math.min(Math.round((files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0) / (1.2 * 1024 * 1024 * 1024 * 1024)) * 100), 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-indigo-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-indigo-500/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-indigo-500/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-indigo-500/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-indigo-500/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">
                  CONTENT MANAGEMENT
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Upload and manage learning resources
                </p>
              </div>

              <MagneticButton
                onClick={handleUploadClick}
                disabled={uploading}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={20} />
                    UPLOAD FILES
                  </>
                )}
              </MagneticButton>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-indigo-500/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {totalFiles}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL FILES</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {usedSize}
            </div>
            <p className="text-sm font-bold text-neutral-600">STORAGE USED</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {mediaStats?.byType?.image || 0}
            </div>
            <p className="text-sm font-bold text-neutral-600">IMAGES</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {mediaStats?.byType?.video || 0}
            </div>
            <p className="text-sm font-bold text-neutral-600">VIDEOS</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-indigo-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <HardDrive className="text-white" size={20} />
            </div>
            STORAGE USAGE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-neutral-700">{usedSize} / {totalSize}</span>
              <span className="font-black text-indigo-600">{usagePercentage}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full transition-all"
                style={{ width: `${usagePercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-neutral-600 font-medium">
              {totalSize === '1.2 TB' && `${(1.2 - 0.487).toFixed(2)} TB available`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-indigo-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-indigo-500/30 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Type Filter */}
          <div>
            <p className="text-sm font-bold text-neutral-700 mb-2">FILE TYPE</p>
            <div className="flex gap-2 flex-wrap">
              {FILE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-indigo-500/30 text-neutral-700 hover:border-indigo-500/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files Grid */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-indigo-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            FILES ({filteredFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Files className="text-indigo-500" size={40} />
              </div>
              <h3 className="text-lg font-black text-neutral-800 mb-2">No Files Found</h3>
              <p className="text-sm text-neutral-600 mb-4">
                {searchQuery || selectedType !== 'All'
                  ? 'Try adjusting your search or filter'
                  : 'Upload some files to get started'}
              </p>
              <MagneticButton
                onClick={handleUploadClick}
                className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black"
              >
                <Upload className="mr-2" size={16} />
                UPLOAD FILES
              </MagneticButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const FileIcon = getFileIcon(file.type)
                const fileColor = getFileColor(file.type)

                return (
                  <div
                    key={file.id}
                    className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-indigo-500/30"
                  >
                    <div className="space-y-4">
                      {/* File Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${fileColor} rounded-lg flex items-center justify-center mx-auto`}>
                        <FileIcon className="text-white" size={32} />
                      </div>

                      {/* File Info */}
                      <div className="text-center">
                        <h3 className="text-base font-black text-neutral-800 mb-2 truncate" title={file.name}>
                          {file.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 mb-1">
                          <HardDrive size={12} />
                          <span>{file.size}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
                          <Clock size={12} />
                          <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div className="text-center">
                        <span className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${fileColor} text-white font-black text-xs uppercase`}>
                          {file.type}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.open(file.path, '_blank')
                            }
                          }}
                          className="h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all"
                          title="View file"
                        >
                          <Eye size={16} className="text-primary" />
                        </button>
                        <a
                          href={file.path}
                          download={file.name}
                          className="h-10 glass-effect border-2 border-success/30 rounded-lg flex items-center justify-center hover:border-success/60 hover:bg-success/10 transition-all"
                          title="Download file"
                        >
                          <Download size={16} className="text-success" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                          title="Delete file"
                        >
                          <Trash2 size={16} className="text-danger" />
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="text-center pt-3 border-t-2 border-neutral-200">
                        <p className="text-xs text-neutral-500 truncate" title={file.path}>
                          {file.path}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
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
} from 'lucide-react'

interface ContentFile {
  id: number
  name: string
  type: 'video' | 'document' | 'image' | 'other'
  size: string
  uploadDate: string
  uploadedBy: string
  downloads: number
  status: 'active' | 'archived'
  thumbnailUrl?: string
}

// Mock content files
const MOCK_FILES: ContentFile[] = [
  {
    id: 1,
    name: 'Safety Training Video.mp4',
    type: 'video',
    size: '245 MB',
    uploadDate: '2024-03-15',
    uploadedBy: 'John Martinez',
    downloads: 89,
    status: 'active',
  },
  {
    id: 2,
    name: 'Construction Guidelines.pdf',
    type: 'document',
    size: '12 MB',
    uploadDate: '2024-03-14',
    uploadedBy: 'Sarah Johnson',
    downloads: 156,
    status: 'active',
  },
  {
    id: 3,
    name: 'Equipment Manual.pdf',
    type: 'document',
    size: '8 MB',
    uploadDate: '2024-03-12',
    uploadedBy: 'Mike Chen',
    downloads: 67,
    status: 'active',
  },
  {
    id: 4,
    name: 'Site Photos Collection.zip',
    type: 'image',
    size: '180 MB',
    uploadDate: '2024-03-10',
    uploadedBy: 'Emily Davis',
    downloads: 45,
    status: 'active',
  },
  {
    id: 5,
    name: 'Welding Techniques.mp4',
    type: 'video',
    size: '320 MB',
    uploadDate: '2024-03-08',
    uploadedBy: 'Tom Wilson',
    downloads: 134,
    status: 'active',
  },
  {
    id: 6,
    name: 'Blueprint Template.dwg',
    type: 'other',
    size: '5 MB',
    uploadDate: '2024-03-05',
    uploadedBy: 'Lisa Anderson',
    downloads: 23,
    status: 'active',
  },
  {
    id: 7,
    name: 'Safety Checklist.xlsx',
    type: 'document',
    size: '2 MB',
    uploadDate: '2024-03-01',
    uploadedBy: 'John Martinez',
    downloads: 201,
    status: 'active',
  },
  {
    id: 8,
    name: 'Heavy Equipment Guide.pdf',
    type: 'document',
    size: '15 MB',
    uploadDate: '2024-02-28',
    uploadedBy: 'Mike Chen',
    downloads: 178,
    status: 'active',
  },
]

const FILE_TYPES = ['All', 'Videos', 'Documents', 'Images', 'Other']

export default function ContentPage() {
  const [files, setFiles] = useState(MOCK_FILES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('All')

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const filteredFiles = files.filter(file => {
    const matchesSearch = !searchQuery ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())

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
  const usedSize = '487 GB'
  const usagePercentage = 39

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

              <MagneticButton className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-black">
                <Upload className="mr-2" size={20} />
                UPLOAD FILES
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-indigo-500/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-blue-600 bg-clip-text text-transparent mb-2">
              {files.length}
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
              {files.reduce((acc, f) => acc + f.downloads, 0)}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL DOWNLOADS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {files.filter(f => {
                const uploadDate = new Date(f.uploadDate)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return uploadDate > weekAgo
              }).length}
            </div>
            <p className="text-sm font-bold text-neutral-600">RECENT UPLOADS</p>
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
                        <Download size={12} />
                        <span>{file.downloads} downloads</span>
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
                      <button className="h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all">
                        <Eye size={16} className="text-primary" />
                      </button>
                      <button className="h-10 glass-effect border-2 border-success/30 rounded-lg flex items-center justify-center hover:border-success/60 hover:bg-success/10 transition-all">
                        <Download size={16} className="text-success" />
                      </button>
                      <button className="h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all">
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-3 border-t-2 border-neutral-200">
                      <p className="text-xs text-neutral-500">
                        Uploaded by <span className="font-bold">{file.uploadedBy}</span>
                      </p>
                      <p className="text-xs text-neutral-500">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

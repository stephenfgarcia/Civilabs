'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  BarChart3,
  FileText,
  Download,
  Calendar,
  Users,
  BookOpen,
  Award,
  DollarSign,
  TrendingUp,
  Filter,
  PieChart,
  LineChart,
  Activity,
} from 'lucide-react'

interface ReportType {
  id: string
  name: string
  description: string
  icon: any
  color: string
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'users',
    name: 'Users Report',
    description: 'User registrations, activity, and demographics',
    icon: Users,
    color: 'from-primary to-blue-600',
  },
  {
    id: 'courses',
    name: 'Courses Report',
    description: 'Course enrollments, completions, and performance',
    icon: BookOpen,
    color: 'from-success to-green-600',
  },
  {
    id: 'enrollments',
    name: 'Enrollments Report',
    description: 'Enrollment trends and patterns',
    icon: TrendingUp,
    color: 'from-warning to-orange-600',
  },
  {
    id: 'certificates',
    name: 'Certificates Report',
    description: 'Certificate issuance and completion rates',
    icon: Award,
    color: 'from-secondary to-purple-600',
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Financial performance and revenue analytics',
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
  },
]

// Mock report data
const MOCK_STATS = {
  totalReportsGenerated: 156,
  reportsThisMonth: 24,
  activeReports: 8,
  exportedReports: 98,
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' })

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-pink-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-pink-500/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-pink-500/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-pink-500/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-pink-500/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent mb-2">
                  ANALYTICS & REPORTS
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Generate insights and export data
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black">
                <Download className="mr-2" size={20} />
                EXPORT ALL
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-pink-500/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent mb-2">
              {MOCK_STATS.totalReportsGenerated}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL REPORTS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {MOCK_STATS.reportsThisMonth}
            </div>
            <p className="text-sm font-bold text-neutral-600">THIS MONTH</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {MOCK_STATS.activeReports}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {MOCK_STATS.exportedReports}
            </div>
            <p className="text-sm font-bold text-neutral-600">EXPORTED</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Selector */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-pink-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            DATE RANGE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">START DATE</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="h-12 glass-effect border-2 border-pink-500/30 focus:border-pink-500 font-medium"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-neutral-700 mb-2 block">END DATE</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="h-12 glass-effect border-2 border-pink-500/30 focus:border-pink-500 font-medium"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Types */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-pink-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="text-white" size={20} />
            </div>
            SELECT REPORT TYPE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TYPES.map((report) => {
              const Icon = report.icon
              const isSelected = selectedReport === report.id

              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`glass-effect rounded-lg p-6 text-left transition-all border-2 ${
                    isSelected
                      ? 'border-pink-500 bg-pink-500/10 scale-105 shadow-lg'
                      : 'border-transparent hover:border-pink-500/30 hover:bg-white/50'
                  }`}
                >
                  <div className="space-y-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${report.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-neutral-800 mb-1">
                        {report.name}
                      </h3>
                      <p className="text-sm text-neutral-600 font-medium">
                        {report.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      {selectedReport && (
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-pink-500/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Download className="text-white" size={20} />
              </div>
              EXPORT OPTIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-neutral-600 font-semibold">
                Selected Report: <span className="font-black text-pink-600">
                  {REPORT_TYPES.find(r => r.id === selectedReport)?.name}
                </span>
              </p>
              <div className="flex gap-3 flex-wrap">
                <MagneticButton className="bg-gradient-to-r from-danger to-red-600 text-white font-black">
                  <FileText className="mr-2" size={16} />
                  EXPORT PDF
                </MagneticButton>
                <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                  <FileText className="mr-2" size={16} />
                  EXPORT CSV
                </MagneticButton>
                <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                  <FileText className="mr-2" size={16} />
                  EXPORT EXCEL
                </MagneticButton>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample Charts Placeholder */}
      {selectedReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <PieChart className="text-primary" size={20} />
                DISTRIBUTION CHART
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg">
                <div className="text-center">
                  <PieChart className="mx-auto mb-2 text-neutral-400" size={48} />
                  <p className="text-neutral-500 font-semibold">Chart visualization placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <LineChart className="text-success" size={20} />
                TREND ANALYSIS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg">
                <div className="text-center">
                  <LineChart className="mx-auto mb-2 text-neutral-400" size={48} />
                  <p className="text-neutral-500 font-semibold">Chart visualization placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <BarChart3 className="text-warning" size={20} />
                COMPARISON CHART
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-2 text-neutral-400" size={48} />
                  <p className="text-neutral-500 font-semibold">Chart visualization placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Activity className="text-secondary" size={20} />
                ACTIVITY METRICS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-neutral-300 rounded-lg">
                <div className="text-center">
                  <Activity className="mx-auto mb-2 text-neutral-400" size={48} />
                  <p className="text-neutral-500 font-semibold">Chart visualization placeholder</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { DistributionChart } from '@/components/charts/DistributionChart'
import { TrendChart } from '@/components/charts/TrendChart'
import { ComparisonChart } from '@/components/charts/ComparisonChart'
import { ActivityChart } from '@/components/charts/ActivityChart'
import { useToast } from '@/lib/hooks'
import { usersService, coursesService, adminEnrollmentsService, certificatesService } from '@/lib/services'
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
  Loader2,
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

// Sample chart data
const DISTRIBUTION_DATA = [
  { name: 'Engineering', value: 450 },
  { name: 'Business', value: 320 },
  { name: 'Design', value: 280 },
  { name: 'Marketing', value: 210 },
  { name: 'Other', value: 140 },
]

const TREND_DATA = [
  { name: 'Jan', enrollments: 120, completions: 80 },
  { name: 'Feb', enrollments: 150, completions: 95 },
  { name: 'Mar', enrollments: 180, completions: 110 },
  { name: 'Apr', enrollments: 220, completions: 140 },
  { name: 'May', enrollments: 250, completions: 170 },
  { name: 'Jun', enrollments: 280, completions: 200 },
]

const COMPARISON_DATA = [
  { name: 'Course A', students: 400, completed: 240 },
  { name: 'Course B', students: 300, completed: 180 },
  { name: 'Course C', students: 280, completed: 210 },
  { name: 'Course D', students: 350, completed: 250 },
]

const ACTIVITY_DATA = [
  { name: 'Mon', value: 145 },
  { name: 'Tue', value: 230 },
  { name: 'Wed', value: 180 },
  { name: 'Thu', value: 290 },
  { name: 'Fri', value: 310 },
  { name: 'Sat', value: 220 },
  { name: 'Sun', value: 160 },
]

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  useEffect(() => {
    if (selectedReport) {
      loadReportData()
    }
  }, [selectedReport, dateRange])

  const loadReportData = async () => {
    if (!selectedReport) return

    try {
      setLoading(true)
      let data: any[] = []

      switch (selectedReport) {
        case 'users':
          const usersResponse = await usersService.getUsers()
          data = usersResponse.data || []
          break
        case 'courses':
          const coursesResponse = await coursesService.getCourses()
          data = coursesResponse.data || []
          break
        case 'enrollments':
          const enrollmentsResponse = await adminEnrollmentsService.getEnrollments()
          data = enrollmentsResponse.data || []
          break
        case 'certificates':
          const certificatesResponse = await certificatesService.getCertificates()
          // getCertificates returns the full object with success, data, count
          data = (certificatesResponse as any).data || []
          break
        case 'revenue':
          // Revenue data would come from a financial service
          data = []
          break
      }

      setReportData(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!selectedReport || reportData.length === 0) {
      toast({
        title: 'No Data',
        description: 'Please select a report with data to export',
        variant: 'destructive'
      })
      return
    }

    try {
      setExporting(true)

      // Get headers based on report type
      let headers: string[] = []
      let rows: any[] = []

      switch (selectedReport) {
        case 'users':
          headers = ['ID', 'Name', 'Email', 'Role', 'Created At']
          rows = reportData.map((user: any) => [
            user.id,
            `${user.firstName} ${user.lastName}`,
            user.email,
            user.role,
            new Date(user.createdAt).toLocaleDateString()
          ])
          break
        case 'courses':
          headers = ['ID', 'Title', 'Category', 'Duration', 'Price', 'Published', 'Enrollments']
          rows = reportData.map((course: any) => [
            course.id,
            course.title,
            course.category,
            course.duration,
            course.price,
            course.published ? 'Yes' : 'No',
            course._count?.enrollments || 0
          ])
          break
        case 'enrollments':
          headers = ['ID', 'User', 'Course', 'Status', 'Progress', 'Enrolled At']
          rows = reportData.map((enrollment: any) => [
            enrollment.id,
            enrollment.user?.email || 'N/A',
            enrollment.course?.title || 'N/A',
            enrollment.status,
            `${enrollment.progress}%`,
            new Date(enrollment.enrolledAt).toLocaleDateString()
          ])
          break
        case 'certificates':
          headers = ['ID', 'User', 'Course', 'Issued Date', 'Certificate Number']
          rows = reportData.map((cert: any) => [
            cert.id,
            cert.user?.email || 'N/A',
            cert.course?.title || 'N/A',
            new Date(cert.issuedAt).toLocaleDateString(),
            cert.certificateNumber
          ])
          break
      }

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Success',
        description: 'CSV file downloaded successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export CSV',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToPDF = () => {
    if (!selectedReport) {
      toast({
        title: 'No Report Selected',
        description: 'Please select a report to export',
        variant: 'destructive'
      })
      return
    }

    try {
      setExporting(true)

      // Use browser's print functionality for PDF export
      window.print()

      toast({
        title: 'PDF Export',
        description: 'Use your browser\'s print dialog to save as PDF'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open print dialog',
        variant: 'destructive'
      })
    } finally {
      setExporting(false)
    }
  }

  const exportToExcel = () => {
    // Excel export uses same CSV format with .xlsx extension
    // For true Excel support, would need additional library
    toast({
      title: 'Info',
      description: 'Excel export uses CSV format. For full Excel features, use a spreadsheet application to open the CSV file.'
    })
    exportToCSV()
  }

  const exportAll = () => {
    if (!selectedReport) {
      toast({
        title: 'No Report Selected',
        description: 'Please select a report to export',
        variant: 'destructive'
      })
      return
    }
    exportToCSV()
  }

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

              <MagneticButton
                onClick={exportAll}
                disabled={!selectedReport || exporting}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black"
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 animate-spin" size={20} />
                    EXPORTING...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={20} />
                    EXPORT ALL
                  </>
                )}
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
                <MagneticButton
                  onClick={exportToPDF}
                  disabled={exporting || loading}
                  className="bg-gradient-to-r from-danger to-red-600 text-white font-black"
                >
                  <FileText className="mr-2" size={16} />
                  EXPORT PDF
                </MagneticButton>
                <MagneticButton
                  onClick={exportToCSV}
                  disabled={exporting || loading || reportData.length === 0}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black"
                >
                  <FileText className="mr-2" size={16} />
                  EXPORT CSV
                </MagneticButton>
                <MagneticButton
                  onClick={exportToExcel}
                  disabled={exporting || loading || reportData.length === 0}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                >
                  <FileText className="mr-2" size={16} />
                  EXPORT EXCEL
                </MagneticButton>
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-pink-600 mt-3">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm font-bold">Loading report data...</span>
                </div>
              )}
              {reportData.length > 0 && !loading && (
                <p className="text-sm font-semibold text-success mt-3">
                  {reportData.length} records loaded and ready to export
                </p>
              )}
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
              <div className="h-64">
                <DistributionChart data={DISTRIBUTION_DATA} />
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
              <div className="h-64">
                <TrendChart
                  data={TREND_DATA}
                  lines={[
                    { dataKey: 'enrollments', name: 'Enrollments', color: '#3B82F6' },
                    { dataKey: 'completions', name: 'Completions', color: '#10B981' },
                  ]}
                />
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
              <div className="h-64">
                <ComparisonChart
                  data={COMPARISON_DATA}
                  bars={[
                    { dataKey: 'students', name: 'Total Students', color: '#F59E0B' },
                    { dataKey: 'completed', name: 'Completed', color: '#10B981' },
                  ]}
                />
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
              <div className="h-64">
                <ActivityChart data={ACTIVITY_DATA} color="#8B5CF6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

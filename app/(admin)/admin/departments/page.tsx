'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/lib/hooks'
import { departmentsService } from '@/lib/services'
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronRight,
  FolderTree,
  Folder,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react'

interface Department {
  id: string
  name: string
  parentDepartment: string | null
  userCount: number
  description: string | null
  createdDate: string
  children?: Array<{ id: string; name: string }>
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: ''
  })

  const { toast } = useToast()

  // Fetch departments from API
  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await departmentsService.getDepartments()

      // Transform API data to match UI interface
      const transformedDepts: Department[] = data.map((dept: any) => ({
        id: dept.id,
        name: dept.name,
        parentDepartment: dept.parent?.name || null,
        userCount: dept._count?.users || 0,
        description: dept.description,
        createdDate: new Date(dept.createdAt).toISOString().split('T')[0],
        children: dept.children,
      }))
      setDepartments(transformedDepts)
    } catch (err) {
      console.error('Error fetching departments:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDepartment = () => {
    setFormData({ name: '', description: '', parentId: '' })
    setIsCreateModalOpen(true)
  }

  const handleEditDepartment = (dept: Department) => {
    setSelectedDepartment(dept)
    setFormData({
      name: dept.name,
      description: dept.description || '',
      parentId: ''
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteDepartment = (dept: Department) => {
    setSelectedDepartment(dept)
    setIsDeleteModalOpen(true)
  }

  const submitCreateDepartment = async () => {
    if (!formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Department name is required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      await departmentsService.createDepartment({
        name: formData.name,
        description: formData.description || undefined,
        parentId: formData.parentId || undefined
      })

      toast({
        title: 'Success',
        description: 'Department created successfully'
      })
      setIsCreateModalOpen(false)
      setFormData({ name: '', description: '', parentId: '' })
      loadDepartments()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create department',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitEditDepartment = async () => {
    if (!selectedDepartment || !formData.name) {
      toast({
        title: 'Validation Error',
        description: 'Department name is required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      await departmentsService.updateDepartment(selectedDepartment.id, {
        name: formData.name,
        description: formData.description || undefined
      })

      toast({
        title: 'Success',
        description: 'Department updated successfully'
      })
      setIsEditModalOpen(false)
      setSelectedDepartment(null)
      setFormData({ name: '', description: '', parentId: '' })
      loadDepartments()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update department',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitDeleteDepartment = async () => {
    if (!selectedDepartment) return

    try {
      setFormLoading(true)
      await departmentsService.deleteDepartment(selectedDepartment.id)

      toast({
        title: 'Success',
        description: 'Department deleted successfully'
      })
      setIsDeleteModalOpen(false)
      setSelectedDepartment(null)
      loadDepartments()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete department',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      const elements = document.querySelectorAll('.admin-item')
      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
      })
    }
  }, [loading])

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => {
      const matchesSearch = !searchQuery ||
        dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesSearch
    })
  }, [departments, searchQuery])

  const { totalUsers, avgUsersPerDept } = useMemo(() => {
    const total = departments.reduce((sum, dept) => sum + dept.userCount, 0)
    const avg = departments.length > 0 ? Math.round(total / departments.length) : 0
    return { totalUsers: total, avgUsersPerDept: avg }
  }, [departments])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-warning mb-4"></div>
          <p className="text-xl font-bold text-neutral-700">Loading departments...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 max-w-md">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 text-danger" size={48} />
            <h2 className="text-2xl font-black text-danger mb-2">ERROR</h2>
            <p className="text-neutral-700 mb-4">{error}</p>
            <MagneticButton
              onClick={() => loadDepartments()}
              className="bg-gradient-to-r from-danger to-red-600 text-white font-black"
            >
              RETRY
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-warning/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-warning via-orange-500 to-amber-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
                  DEPARTMENTS
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Organize teams and manage hierarchy
                </p>
              </div>

              <MagneticButton
                onClick={handleCreateDepartment}
                className="bg-gradient-to-r from-warning to-orange-600 text-white font-black"
              >
                <Plus className="mr-2" size={20} />
                ADD DEPARTMENT
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {departments.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL DEPARTMENTS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {totalUsers}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL USERS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {avgUsersPerDept}
            </div>
            <p className="text-sm font-bold text-neutral-600">AVG USERS/DEPT</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
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
              placeholder="Search departments by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-warning/30 focus:border-warning font-medium"
            />
          </div>

          <p className="text-sm text-neutral-600">
            Showing {filteredDepartments.length} of {departments.length} departments
          </p>
        </CardContent>
      </Card>

      {/* Department Hierarchy Info */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <FolderTree className="text-white" size={20} />
            </div>
            ORGANIZATIONAL HIERARCHY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {departments
              .filter(d => !d.parentDepartment)
              .map((parentDept) => (
                <div key={parentDept.id} className="space-y-2">
                  {/* Parent Department */}
                  <div className="glass-effect rounded-lg p-4 border-2 border-warning/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-neutral-800">{parentDept.name}</h3>
                        <p className="text-sm text-neutral-600">{parentDept.userCount} users</p>
                      </div>
                      <ChevronRight className="text-neutral-400" size={20} />
                    </div>
                  </div>

                  {/* Child Departments */}
                  {departments
                    .filter(d => d.parentDepartment === parentDept.name)
                    .map((childDept) => (
                      <div key={childDept.id} className="ml-12 glass-effect rounded-lg p-4 border-2 border-warning/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                            <Building2 className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-neutral-700">{childDept.name}</h4>
                            <p className="text-xs text-neutral-500">{childDept.userCount} users</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            ALL DEPARTMENTS ({filteredDepartments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-warning/30"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-neutral-800 mb-1">
                          {dept.name}
                        </h3>
                        {dept.parentDepartment && (
                          <p className="text-xs font-semibold text-warning flex items-center gap-1">
                            <ChevronRight size={12} />
                            {dept.parentDepartment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 font-medium">
                    {dept.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y-2 border-neutral-200">
                    <div className="text-center">
                      <Users className="mx-auto mb-1 text-warning" size={20} />
                      <p className="font-black text-2xl text-neutral-800">{dept.userCount}</p>
                      <p className="text-xs text-neutral-600">Users</p>
                    </div>
                    {dept.children && dept.children.length > 0 && (
                      <div className="text-center">
                        <Folder className="mx-auto mb-1 text-primary" size={20} />
                        <p className="font-black text-2xl text-neutral-800">{dept.children.length}</p>
                        <p className="text-xs text-neutral-600">Sub-departments</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditDepartment(dept)}
                      className="flex-1 h-10 glass-effect border-2 border-warning/30 rounded-lg flex items-center justify-center gap-2 hover:border-warning/60 hover:bg-warning/10 transition-all font-bold text-sm"
                    >
                      <Edit size={16} className="text-warning" />
                      EDIT
                    </button>
                    <button className="flex-1 h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/10 transition-all font-bold text-sm">
                      <Users size={16} className="text-primary" />
                      MANAGE
                    </button>
                    <button
                      onClick={() => handleDeleteDepartment(dept)}
                      className="w-10 h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                    >
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-neutral-500">
                    Created: {new Date(dept.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Department Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="glass-effect border-warning/30">
          <DialogHeader>
            <DialogTitle className="text-warning">Create New Department</DialogTitle>
            <DialogDescription>Add a new department to organize your teams</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter department description"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Parent Department (Optional)</label>
              <select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
              >
                <option value="">None (Top-level)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitCreateDepartment} disabled={formLoading} className="bg-warning hover:bg-warning/80">
              {formLoading ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-effect border-warning/30">
          <DialogHeader>
            <DialogTitle className="text-warning">Edit Department</DialogTitle>
            <DialogDescription>Update department information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Department Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter department name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter department description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitEditDepartment} disabled={formLoading} className="bg-warning hover:bg-warning/80">
              {formLoading ? 'Updating...' : 'Update Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass-effect border-danger/30">
          <DialogHeader>
            <DialogTitle className="text-danger">Delete Department</DialogTitle>
            <DialogDescription>Are you sure you want to delete this department?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium mb-2">
              Department: <span className="font-bold">{selectedDepartment?.name}</span>
            </p>
            {selectedDepartment && selectedDepartment.userCount > 0 && (
              <p className="text-sm text-warning font-semibold mb-2">
                Warning: This department has {selectedDepartment.userCount} user(s).
              </p>
            )}
            <p className="text-sm text-danger font-semibold mt-4">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={submitDeleteDepartment}
              disabled={formLoading}
              variant="destructive"
            >
              {formLoading ? 'Deleting...' : 'Delete Department'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

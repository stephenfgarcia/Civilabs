/**
 * Departments API Service
 * Handles department/organization management
 */

import { apiClient } from './api-client'

export interface Department {
  id: string
  name: string
  description: string | null
  parentId: string | null
  createdAt: Date
  updatedAt: Date
  parent?: {
    id: string
    name: string
  }
  children?: {
    id: string
    name: string
  }[]
  _count?: {
    users: number
    children: number
  }
}

class DepartmentsService {
  /**
   * Get all departments
   */
  async getDepartments(options?: {
    parentId?: string | null
    search?: string
  }): Promise<Department[]> {
    const params = new URLSearchParams()
    if (options?.parentId !== undefined) {
      params.append('parentId', options.parentId || 'null')
    }
    if (options?.search) {
      params.append('search', options.search)
    }

    const response = await apiClient.get<{ departments: Department[] }>(
      `/departments${params.toString() ? `?${params.toString()}` : ''}`
    )
    return response.data?.departments || []
  }

  /**
   * Get department by ID
   */
  async getDepartmentById(id: string): Promise<Department> {
    const response = await apiClient.get<Department>(`/departments/${id}`)
    return response.data!
  }

  /**
   * Create new department (admin only)
   */
  async createDepartment(data: {
    name: string
    parentId?: string
    description?: string
  }): Promise<Department> {
    const response = await apiClient.post<Department>('/departments', data)
    return response.data!
  }

  /**
   * Update department (admin only)
   */
  async updateDepartment(
    id: string,
    data: {
      name?: string
      parentId?: string
      description?: string
    }
  ): Promise<Department> {
    const response = await apiClient.put<Department>(`/departments/${id}`, data)
    return response.data!
  }

  /**
   * Delete department (admin only)
   */
  async deleteDepartment(id: string): Promise<void> {
    await apiClient.delete(`/departments/${id}`)
  }

  /**
   * Get department hierarchy tree
   */
  async getDepartmentTree(): Promise<Department[]> {
    return this.getDepartments({ parentId: null })
  }
}

export const departmentsService = new DepartmentsService()
export default departmentsService

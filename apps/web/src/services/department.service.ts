import { enhancedApiClient } from '../lib/api-client';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    staff: number;
  };
}

export interface CreateDepartmentDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentResponse {
  success: boolean;
  message?: string;
  data: Department;
}

export interface DepartmentListResponse {
  success: boolean;
  data: Department[];
}

const departmentService = {
  /**
   * Create a new department
   */
  createDepartment: async (
    data: CreateDepartmentDto,
  ): Promise<DepartmentResponse> => {
    return enhancedApiClient.post('/departments', data);
  },

  /**
   * Get all departments
   */
  getDepartments: async (isActive?: boolean): Promise<DepartmentListResponse> => {
    const params = isActive !== undefined ? { isActive: isActive.toString() } : {};
    return enhancedApiClient.get('/departments', params);
  },

  /**
   * Get department by ID
   */
  getDepartmentById: async (id: string): Promise<DepartmentResponse> => {
    return enhancedApiClient.get(`/departments/${id}`);
  },

  /**
   * Update department
   */
  updateDepartment: async (
    id: string,
    data: UpdateDepartmentDto,
  ): Promise<DepartmentResponse> => {
    return enhancedApiClient.patch(`/departments/${id}`, data);
  },

  /**
   * Delete department (soft delete)
   */
  deleteDepartment: async (id: string): Promise<{ success: boolean; message: string }> => {
    return enhancedApiClient.delete(`/departments/${id}`);
  },
};

export default departmentService;

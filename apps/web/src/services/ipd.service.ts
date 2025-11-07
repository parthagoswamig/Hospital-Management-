import apiClient from './api-client';

export enum IPDAdmissionStatus {
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
}

// ============= TYPE DEFINITIONS =============

export interface IPDAdmission {
  id: string;
  patientId: string;
  admissionDate: string;
  departmentId?: string;
  wardId?: string;
  bedId?: string;
  doctorId: string;
  diagnosis?: string;
  admissionReason?: string;
  status: IPDAdmissionStatus;
  notes?: string;
  dischargeDate?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    medicalRecordNumber: string;
    phone?: string;
    email?: string;
    gender?: string;
    bloodType?: string;
    dateOfBirth?: string;
    address?: string;
  };
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
    licenseNumber?: string;
  };
  department?: {
    id: string;
    name: string;
  };
  ward?: {
    id: string;
    name: string;
  };
  bed?: {
    id: string;
    bedNumber: string;
  };
  treatments?: IPDTreatment[];
  dischargeSummary?: IPDDischargeSummary;
}

export interface IPDTreatment {
  id: string;
  admissionId: string;
  treatmentDate: string;
  doctorId: string;
  notes?: string;
  treatmentPlan?: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  doctor?: {
    id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
}

export interface IPDDischargeSummary {
  id: string;
  admissionId: string;
  dischargeDate: string;
  finalDiagnosis?: string;
  treatmentGiven?: string;
  conditionAtDischarge?: string;
  followUpAdvice?: string;
  createdBy: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// ============= DTO TYPES =============

export interface CreateIPDAdmissionDto {
  patientId: string;
  admissionDate?: string;
  departmentId?: string;
  wardId?: string;
  bedId?: string;
  doctorId?: string;
  diagnosis?: string;
  admissionReason?: string;
  notes?: string;
}

export interface UpdateIPDAdmissionDto {
  patientId?: string;
  admissionDate?: string;
  departmentId?: string;
  wardId?: string;
  bedId?: string;
  doctorId?: string;
  diagnosis?: string;
  admissionReason?: string;
  notes?: string;
  status?: IPDAdmissionStatus;
  dischargeDate?: string;
}

export interface IPDAdmissionQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: IPDAdmissionStatus;
  doctorId?: string;
  departmentId?: string;
  wardId?: string;
  date?: string;
}

export interface CreateIPDTreatmentDto {
  admissionId: string;
  treatmentDate?: string;
  doctorId?: string;
  notes?: string;
  treatmentPlan?: string;
}

export interface CreateIPDDischargeSummaryDto {
  admissionId: string;
  dischargeDate?: string;
  finalDiagnosis?: string;
  treatmentGiven?: string;
  conditionAtDischarge?: string;
  followUpAdvice?: string;
}

// ============= RESPONSE TYPES =============

export interface IPDAdmissionsListResponse {
  success: boolean;
  data: {
    admissions: IPDAdmission[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface IPDAdmissionResponse {
  success: boolean;
  message?: string;
  data: IPDAdmission;
}

export interface IPDTreatmentResponse {
  success: boolean;
  message?: string;
  data: IPDTreatment;
}

export interface IPDDischargeSummaryResponse {
  success: boolean;
  message?: string;
  data: IPDDischargeSummary;
}

export interface IPDStatsResponse {
  success: boolean;
  data: {
    totalAdmitted: number;
    totalDischarged: number;
    availableBeds: number;
    occupiedBeds: number;
    bedOccupancyRate: string;
  };
}

// ============= API SERVICE =============

const ipdService = {
  // Admission APIs
  async admitPatient(data: CreateIPDAdmissionDto): Promise<IPDAdmissionResponse> {
    const response = await apiClient.post('/ipd/admit', data) as any;
    return response.data;
  },

  async getAdmissions(params?: IPDAdmissionQueryDto): Promise<IPDAdmissionsListResponse> {
    const response = await apiClient.get('/ipd/admissions', { params }) as any;
    return response.data;
  },

  async getAdmission(id: string): Promise<IPDAdmissionResponse> {
    const response = await apiClient.get(`/ipd/admissions/${id}`) as any;
    return response.data;
  },

  async updateAdmission(id: string, data: UpdateIPDAdmissionDto): Promise<IPDAdmissionResponse> {
    const response = await apiClient.patch(`/ipd/admissions/${id}`, data) as any;
    return response.data;
  },

  async dischargePatient(id: string): Promise<IPDAdmissionResponse> {
    const response = await apiClient.delete(`/ipd/admissions/${id}/discharge`) as any;
    return response.data;
  },

  // Treatment APIs
  async addTreatment(data: CreateIPDTreatmentDto): Promise<IPDTreatmentResponse> {
    const response = await apiClient.post('/ipd/treatment', data) as any;
    return response.data;
  },

  // Discharge Summary APIs
  async createDischargeSummary(data: CreateIPDDischargeSummaryDto): Promise<IPDDischargeSummaryResponse> {
    const response = await apiClient.post('/ipd/discharge-summary', data) as any;
    return response.data;
  },

  async getAdmissionSummary(admissionId: string): Promise<IPDAdmissionResponse> {
    const response = await apiClient.get(`/ipd/summary/${admissionId}`) as any;
    return response.data;
  },

  // Stats API
  async getStats(): Promise<IPDStatsResponse> {
    const response = await apiClient.get('/ipd/stats') as any;
    return response.data;
  },
};

export default ipdService;

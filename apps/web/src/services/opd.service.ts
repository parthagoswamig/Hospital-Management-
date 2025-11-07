import { enhancedApiClient } from '../lib/api-client';

/**
 * OPD (Out-Patient Department) API Service
 * Handles all OPD operations including visit management, vitals, and prescriptions
 */

// ==================== Types ====================

export type OPDVisitStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface CreateOPDVisitDto {
  patientId: string;
  doctorId?: string;
  departmentId?: string;
  visitDate?: string;
  complaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status?: OPDVisitStatus;
}

export interface UpdateOPDVisitDto {
  doctorId?: string;
  departmentId?: string;
  visitDate?: string;
  complaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status?: OPDVisitStatus;
}

export interface CreateOPDVitalsDto {
  visitId: string;
  height?: number;
  weight?: number;
  bp?: string;
  pulse?: number;
  temperature?: number;
  respirationRate?: number;
  spo2?: number;
  notes?: string;
  recordedBy?: string;
}

export interface CreateOPDPrescriptionDto {
  visitId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface OPDVisitQueryDto {
  page?: number;
  limit?: number;
  status?: OPDVisitStatus;
  doctorId?: string;
  departmentId?: string;
  patientId?: string;
  date?: string;
  search?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  medicalRecordNumber: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  allergies?: any;
  chronicConditions?: any;
  address?: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization?: string;
  licenseNumber?: string;
  signature?: string;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
}

export interface OPDVitals {
  id: string;
  visitId: string;
  height?: number;
  weight?: number;
  bp?: string;
  pulse?: number;
  temperature?: number;
  respirationRate?: number;
  spo2?: number;
  notes?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OPDPrescription {
  id: string;
  visitId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OPDVisit {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId?: string;
  visitDate: string;
  complaint?: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  status: OPDVisitStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  doctor?: Doctor;
  department?: Department;
  vitals?: OPDVitals[];
  prescriptions?: OPDPrescription[];
}

export interface OPDVisitResponse {
  success: boolean;
  message?: string;
  data: OPDVisit;
}

export interface OPDVisitsListResponse {
  success: boolean;
  data: {
    visits: OPDVisit[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

export interface OPDVitalsResponse {
  success: boolean;
  message?: string;
  data: OPDVitals;
}

export interface OPDPrescriptionResponse {
  success: boolean;
  message?: string;
  data: OPDPrescription;
}

// ==================== Service ====================

const opdService = {
  // ==================== OPD VISIT OPERATIONS ====================

  /**
   * Create new OPD visit
   */
  createVisit: async (data: CreateOPDVisitDto): Promise<OPDVisitResponse> => {
    return enhancedApiClient.post('/opd/visits', data);
  },

  /**
   * Get all OPD visits with filters
   */
  getVisits: async (query?: OPDVisitQueryDto): Promise<OPDVisitsListResponse> => {
    return enhancedApiClient.get('/opd/visits', query);
  },

  /**
   * Get OPD visit by ID
   */
  getVisitById: async (id: string): Promise<OPDVisitResponse> => {
    return enhancedApiClient.get(`/opd/visits/${id}`);
  },

  /**
   * Update OPD visit
   */
  updateVisit: async (id: string, data: UpdateOPDVisitDto): Promise<OPDVisitResponse> => {
    return enhancedApiClient.patch(`/opd/visits/${id}`, data);
  },

  /**
   * Delete OPD visit (soft delete)
   */
  deleteVisit: async (id: string): Promise<{ success: boolean; message: string }> => {
    return enhancedApiClient.delete(`/opd/visits/${id}`);
  },

  // ==================== OPD VITALS OPERATIONS ====================

  /**
   * Add vitals to an OPD visit
   */
  addVitals: async (data: CreateOPDVitalsDto): Promise<OPDVitalsResponse> => {
    return enhancedApiClient.post('/opd/vitals', data);
  },

  // ==================== OPD PRESCRIPTION OPERATIONS ====================

  /**
   * Add prescription to an OPD visit
   */
  addPrescription: async (data: CreateOPDPrescriptionDto): Promise<OPDPrescriptionResponse> => {
    return enhancedApiClient.post('/opd/prescriptions', data);
  },

  // ==================== SUMMARY OPERATIONS ====================

  /**
   * Get complete visit summary
   */
  getVisitSummary: async (visitId: string): Promise<OPDVisitResponse> => {
    return enhancedApiClient.get(`/opd/summary/${visitId}`);
  },
};

export default opdService;

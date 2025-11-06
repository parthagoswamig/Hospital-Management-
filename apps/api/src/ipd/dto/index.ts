// Export all IPD DTOs and enums
export * from './ipd.dto';

// Export admission-related DTOs explicitly
export {
  AdmissionStatus,
  CreateAdmissionDto,
  UpdateAdmissionDto,
  DischargePatientDto,
  TransferPatientDto,
  AdmissionFilterDto,
} from './ipd.dto';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum IPDAdmissionStatus {
  ADMITTED = 'ADMITTED',
  DISCHARGED = 'DISCHARGED',
}

// ============= ADMISSION DTOs =============

export class CreateIPDAdmissionDto {
  @ApiProperty({ example: 'cuid123', description: 'Patient ID' })
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:00:00Z', description: 'Admission date and time' })
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional({ example: 'dept123', description: 'Department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'ward123', description: 'Ward ID' })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({ example: 'bed123', description: 'Bed ID' })
  @IsOptional()
  @IsString()
  bedId?: string;

  @ApiPropertyOptional({ example: 'doctor123', description: 'Doctor ID' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'Acute appendicitis', description: 'Initial diagnosis' })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({ example: 'Severe abdominal pain', description: 'Reason for admission' })
  @IsOptional()
  @IsString()
  admissionReason?: string;

  @ApiPropertyOptional({ example: 'Patient requires immediate surgery', description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateIPDAdmissionDto extends PartialType(CreateIPDAdmissionDto) {
  @ApiPropertyOptional({ enum: IPDAdmissionStatus })
  @IsOptional()
  @IsEnum(IPDAdmissionStatus)
  status?: IPDAdmissionStatus;

  @ApiPropertyOptional({ example: '2024-01-20T14:00:00Z', description: 'Discharge date and time' })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;
}

export class IPDAdmissionQueryDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'John', description: 'Search by patient name or MRN' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: IPDAdmissionStatus, description: 'Filter by admission status' })
  @IsOptional()
  @IsEnum(IPDAdmissionStatus)
  status?: IPDAdmissionStatus;

  @ApiPropertyOptional({ example: 'doctor123', description: 'Filter by doctor ID' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'dept123', description: 'Filter by department ID' })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'ward123', description: 'Filter by ward ID' })
  @IsOptional()
  @IsString()
  wardId?: string;

  @ApiPropertyOptional({ example: '2024-01-01', description: 'Filter by admission date (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  date?: string;
}

// ============= TREATMENT DTOs =============

export class CreateIPDTreatmentDto {
  @ApiProperty({ example: 'admission123', description: 'Admission ID' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiPropertyOptional({ example: '2024-01-16T09:00:00Z', description: 'Treatment date and time' })
  @IsOptional()
  @IsDateString()
  treatmentDate?: string;

  @ApiPropertyOptional({ example: 'doctor123', description: 'Doctor ID' })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiPropertyOptional({ example: 'Patient responding well to antibiotics', description: 'Treatment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: 'Continue IV antibiotics for 3 more days', description: 'Treatment plan' })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;
}

export class UpdateIPDTreatmentDto extends PartialType(CreateIPDTreatmentDto) {}

// ============= DISCHARGE SUMMARY DTOs =============

export class CreateIPDDischargeSummaryDto {
  @ApiProperty({ example: 'admission123', description: 'Admission ID' })
  @IsString()
  @IsNotEmpty()
  admissionId: string;

  @ApiPropertyOptional({ example: '2024-01-20T14:00:00Z', description: 'Discharge date and time' })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;

  @ApiPropertyOptional({ example: 'Post-operative appendicitis, recovered', description: 'Final diagnosis' })
  @IsOptional()
  @IsString()
  finalDiagnosis?: string;

  @ApiPropertyOptional({ example: 'Appendectomy performed, IV antibiotics administered', description: 'Treatment given during admission' })
  @IsOptional()
  @IsString()
  treatmentGiven?: string;

  @ApiPropertyOptional({ example: 'Stable, wound healing well', description: 'Condition at discharge' })
  @IsOptional()
  @IsString()
  conditionAtDischarge?: string;

  @ApiPropertyOptional({ example: 'Follow-up in 1 week, continue oral antibiotics', description: 'Follow-up advice' })
  @IsOptional()
  @IsString()
  followUpAdvice?: string;
}

export class UpdateIPDDischargeSummaryDto extends PartialType(CreateIPDDischargeSummaryDto) {}

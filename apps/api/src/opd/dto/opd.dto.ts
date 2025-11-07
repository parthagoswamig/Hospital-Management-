import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
  Max,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Enum for OPD visit status
 */
export enum OPDVisitStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * DTO for creating OPD visits
 */
export class CreateOPDVisitDto {
  @ApiProperty({
    example: 'patient-uuid-123',
    description: 'ID of the patient visiting OPD',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({
    example: 'doctor-uuid-123',
    description: 'ID of the doctor (auto-assigned if not provided)',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'department-uuid-123',
    description: 'ID of the department',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: '2024-01-15T10:00:00.000Z',
    description: 'Visit date and time',
  })
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @ApiPropertyOptional({
    example: 'Severe headache for past 3 days',
    description: 'Chief complaint of the patient',
  })
  @IsOptional()
  @IsString()
  complaint?: string;

  @ApiPropertyOptional({
    example: 'Migraine - suspected tension headache',
    description: 'Initial or final diagnosis',
  })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiPropertyOptional({
    example: 'Prescribed pain medication and rest for 3 days',
    description: 'Treatment plan',
  })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiPropertyOptional({
    example: 'Patient advised to monitor symptoms and return if worsens',
    description: 'Additional notes about the visit',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    enum: OPDVisitStatus,
    example: OPDVisitStatus.PENDING,
    default: OPDVisitStatus.PENDING,
    description: 'Current status of the visit',
  })
  @IsOptional()
  @IsEnum(OPDVisitStatus)
  status?: OPDVisitStatus;
}

/**
 * DTO for updating OPD visits
 */
export class UpdateOPDVisitDto extends PartialType(CreateOPDVisitDto) {}

/**
 * DTO for creating OPD vitals
 */
export class CreateOPDVitalsDto {
  @ApiProperty({
    example: 'visit-uuid-123',
    description: 'ID of the OPD visit',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  visitId: string;

  @ApiPropertyOptional({
    example: 175.5,
    description: 'Height in cm',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  height?: number;

  @ApiPropertyOptional({
    example: 70.5,
    description: 'Weight in kg',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(500)
  weight?: number;

  @ApiPropertyOptional({
    example: '120/80',
    description: 'Blood pressure',
  })
  @IsOptional()
  @IsString()
  bp?: string;

  @ApiPropertyOptional({
    example: 72,
    description: 'Pulse rate (bpm)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  pulse?: number;

  @ApiPropertyOptional({
    example: 98.6,
    description: 'Temperature in Fahrenheit',
  })
  @IsOptional()
  @IsNumber()
  @Min(90)
  @Max(110)
  temperature?: number;

  @ApiPropertyOptional({
    example: 16,
    description: 'Respiration rate (breaths per minute)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  respirationRate?: number;

  @ApiPropertyOptional({
    example: 98,
    description: 'Oxygen saturation (%)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  spo2?: number;

  @ApiPropertyOptional({
    example: 'Patient appears stable',
    description: 'Additional notes about vitals',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    example: 'nurse-uuid-123',
    description: 'ID of the person who recorded vitals',
  })
  @IsOptional()
  @IsString()
  recordedBy?: string;
}

/**
 * DTO for creating OPD prescription
 */
export class CreateOPDPrescriptionDto {
  @ApiProperty({
    example: 'visit-uuid-123',
    description: 'ID of the OPD visit',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  visitId: string;

  @ApiProperty({
    example: 'Paracetamol 500mg',
    description: 'Name of the medication',
  })
  @IsString()
  @IsNotEmpty()
  medicationName: string;

  @ApiProperty({
    example: '500mg',
    description: 'Dosage of the medication',
  })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    example: 'Twice daily',
    description: 'Frequency of medication',
  })
  @IsString()
  @IsNotEmpty()
  frequency: string;

  @ApiProperty({
    example: '5 days',
    description: 'Duration of medication',
  })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiPropertyOptional({
    example: 'Take after meals',
    description: 'Additional instructions',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO for filtering OPD visits
 */
export class OPDVisitQueryDto {
  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
    description: 'Page number for pagination',
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Number of items per page',
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: OPDVisitStatus,
    example: OPDVisitStatus.PENDING,
    description: 'Filter by visit status',
  })
  @IsOptional()
  @IsEnum(OPDVisitStatus)
  status?: OPDVisitStatus;

  @ApiPropertyOptional({
    example: 'doctor-uuid-123',
    description: 'Filter by doctor ID',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  doctorId?: string;

  @ApiPropertyOptional({
    example: 'department-uuid-123',
    description: 'Filter by department ID',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: '2024-01-15',
    description: 'Filter by specific date (YYYY-MM-DD format)',
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    example: 'patient-uuid-123',
    description: 'Filter by patient ID',
  })
  @IsOptional()
  @IsString()
  @IsUUID()
  patientId?: string;

  @ApiPropertyOptional({
    example: 'headache',
    description: 'Search in complaint or diagnosis',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

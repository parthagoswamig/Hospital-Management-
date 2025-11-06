import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
} from 'class-validator';
import { QueryDto } from '../../shared/dto/query.dto';

export enum SurgeryStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  POSTPONED = 'POSTPONED',
}

export enum SurgeryType {
  ELECTIVE = 'ELECTIVE',
  EMERGENCY = 'EMERGENCY',
  URGENT = 'URGENT',
}

export class CreateSurgeryDto {
  @IsString()
  patientId: string;

  @IsString()
  surgeonId: string;

  @IsString()
  procedureName: string;

  @IsEnum(SurgeryType)
  surgeryType: SurgeryType;

  @IsDateString()
  scheduledDate: string;

  @IsString()
  @IsOptional()
  operatingRoom?: string;

  @IsString()
  @IsOptional()
  anesthesiaType?: string;

  @IsArray()
  @IsOptional()
  assistingSurgeons?: string[];

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateSurgeryDto {
  @IsString()
  @IsOptional()
  surgeonId?: string;

  @IsString()
  @IsOptional()
  procedureName?: string;

  @IsEnum(SurgeryType)
  @IsOptional()
  surgeryType?: SurgeryType;

  @IsDateString()
  @IsOptional()
  scheduledDate?: string;

  @IsDateString()
  @IsOptional()
  actualStartTime?: string;

  @IsDateString()
  @IsOptional()
  actualEndTime?: string;

  @IsEnum(SurgeryStatus)
  @IsOptional()
  status?: SurgeryStatus;

  @IsString()
  @IsOptional()
  operatingRoom?: string;

  @IsString()
  @IsOptional()
  anesthesiaType?: string;

  @IsArray()
  @IsOptional()
  assistingSurgeons?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  outcome?: string;
}

export class QuerySurgeryDto extends QueryDto {
  @IsOptional()
  @IsEnum(SurgeryStatus)
  status?: SurgeryStatus;

  @IsOptional()
  @IsEnum(SurgeryType)
  surgeryType?: SurgeryType;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  surgeonId?: string;
}

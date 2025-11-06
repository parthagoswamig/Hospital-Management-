import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
} from 'class-validator';
import {
  TelemedicineStatus,
  ConsultationType,
} from './create-telemedicine.dto';

export class UpdateTelemedicineDto {
  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsEnum(TelemedicineStatus)
  @IsOptional()
  status?: TelemedicineStatus;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsDateString()
  @IsOptional()
  startedAt?: string;

  @IsDateString()
  @IsOptional()
  endedAt?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsEnum(ConsultationType)
  @IsOptional()
  consultationType?: ConsultationType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  prescription?: string;

  @IsBoolean()
  @IsOptional()
  followUpRequired?: boolean;

  @IsDateString()
  @IsOptional()
  followUpDate?: string;

  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

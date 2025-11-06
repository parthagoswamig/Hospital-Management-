import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum TelemedicineStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ConsultationType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
}

export class CreateTelemedicineDto {
  @IsString()
  patientId: string;

  @IsString()
  @IsOptional()
  doctorId?: string;

  @IsEnum(TelemedicineStatus)
  @IsOptional()
  status?: TelemedicineStatus;

  @IsDateString()
  scheduledAt: string;

  @IsEnum(ConsultationType)
  @IsOptional()
  consultationType?: ConsultationType;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isEmergency?: boolean;
}

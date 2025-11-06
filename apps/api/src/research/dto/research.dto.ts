import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { QueryDto } from '../../shared/dto/query.dto';

export enum ResearchStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateResearchProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  principalInvestigator: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(ResearchStatus)
  @IsOptional()
  status?: ResearchStatus;

  @IsString()
  @IsOptional()
  ethicsApprovalNumber?: string;
}

export class UpdateResearchProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  principalInvestigator?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsEnum(ResearchStatus)
  @IsOptional()
  status?: ResearchStatus;

  @IsString()
  @IsOptional()
  ethicsApprovalNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryResearchDto extends QueryDto {
  @IsOptional()
  @IsEnum(ResearchStatus)
  status?: ResearchStatus;

  @IsOptional()
  @IsString()
  principalInvestigator?: string;
}

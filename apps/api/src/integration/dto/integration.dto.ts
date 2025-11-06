import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsObject,
} from 'class-validator';
import { QueryDto } from '../../shared/dto/query.dto';

export enum IntegrationType {
  HL7 = 'HL7',
  FHIR = 'FHIR',
  REST_API = 'REST_API',
  WEBHOOK = 'WEBHOOK',
  CUSTOM = 'CUSTOM',
}

export enum IntegrationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

export class CreateIntegrationDto {
  @IsString()
  name: string;

  @IsEnum(IntegrationType)
  type: IntegrationType;

  @IsString()
  endpoint: string;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateIntegrationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(IntegrationType)
  @IsOptional()
  type?: IntegrationType;

  @IsString()
  @IsOptional()
  endpoint?: string;

  @IsObject()
  @IsOptional()
  configuration?: Record<string, any>;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsEnum(IntegrationStatus)
  @IsOptional()
  status?: IntegrationStatus;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryIntegrationDto extends QueryDto {
  @IsOptional()
  @IsEnum(IntegrationType)
  type?: IntegrationType;

  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;
}

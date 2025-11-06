import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ClaimStatus } from './create-claim.dto';

export class UpdateClaimDto {
  @IsString()
  @IsOptional()
  policyNumber?: string;

  @IsString()
  @IsOptional()
  insuranceProvider?: string;

  @IsNumber()
  @IsOptional()
  claimAmount?: number;

  @IsNumber()
  @IsOptional()
  approvedAmount?: number;

  @IsDateString()
  @IsOptional()
  submittedAt?: string;

  @IsDateString()
  @IsOptional()
  processedAt?: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatmentDetails?: string;

  @IsEnum(ClaimStatus)
  @IsOptional()
  status?: ClaimStatus;

  @IsString()
  @IsOptional()
  remarks?: string;
}

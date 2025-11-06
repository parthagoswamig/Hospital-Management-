import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';

export enum ClaimStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

export class CreateClaimDto {
  @IsString()
  patientId: string;

  @IsString()
  policyNumber: string;

  @IsString()
  insuranceProvider: string;

  @IsNumber()
  claimAmount: number;

  @IsDateString()
  submittedAt: string;

  @IsString()
  @IsOptional()
  diagnosis?: string;

  @IsString()
  @IsOptional()
  treatmentDetails?: string;

  @IsEnum(ClaimStatus)
  @IsOptional()
  status?: ClaimStatus;
}

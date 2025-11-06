import { IsOptional, IsString, IsEnum } from 'class-validator';
import { QueryDto } from '../../shared/dto/query.dto';
import { ClaimStatus } from './create-claim.dto';

export class QueryClaimDto extends QueryDto {
  @IsOptional()
  @IsEnum(ClaimStatus)
  status?: ClaimStatus;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  insuranceProvider?: string;
}

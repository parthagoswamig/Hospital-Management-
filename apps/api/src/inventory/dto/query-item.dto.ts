import { IsOptional, IsString } from 'class-validator';
import { QueryDto } from '../../shared/dto/query.dto';

export class QueryInventoryDto extends QueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

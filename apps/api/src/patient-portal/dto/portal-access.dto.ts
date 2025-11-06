import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreatePortalAccessDto {
  @IsString()
  patientId: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePortalAccessDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class QueryPortalAccessDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

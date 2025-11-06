import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  departmentId?: string;

  @IsString()
  designation: string;

  @IsString()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  joiningDate?: string;

  @IsString()
  @IsOptional()
  qualification?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

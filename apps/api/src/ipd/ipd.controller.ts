import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { IpdService } from './ipd.service';
import {
  CreateIPDAdmissionDto,
  UpdateIPDAdmissionDto,
  IPDAdmissionQueryDto,
  CreateIPDTreatmentDto,
  CreateIPDDischargeSummaryDto,
} from './dto/ipd.dto';
import { JwtAuthGuard } from '../core/auth/guards/jwt-auth.guard';
import { TenantGuard } from '../core/rbac/guards/tenant.guard';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('IPD')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('ipd')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class IpdController {
  constructor(private readonly ipdService: IpdService) {}

  // ============= ADMISSION ENDPOINTS =============

  @Post('admit')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Admit a patient' })
  @ApiResponse({ status: 201, description: 'Patient admitted successfully' })
  async admitPatient(
    @Body() dto: CreateIPDAdmissionDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.ipdService.createAdmission(dto, tenantId, req.user.userId);
  }

  @Get('admissions')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all admissions' })
  @ApiResponse({ status: 200, description: 'Admissions retrieved successfully' })
  async getAllAdmissions(
    @TenantId() tenantId: string,
    @Query() query: IPDAdmissionQueryDto,
  ) {
    return this.ipdService.findAllAdmissions(tenantId, query);
  }

  @Get('admissions/:id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admission by ID' })
  @ApiResponse({ status: 200, description: 'Admission retrieved successfully' })
  async getAdmission(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.ipdService.findOneAdmission(id, tenantId);
  }

  @Patch('admissions/:id')
  @Roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update admission' })
  @ApiResponse({ status: 200, description: 'Admission updated successfully' })
  async updateAdmission(
    @Param('id') id: string,
    @Body() dto: UpdateIPDAdmissionDto,
    @TenantId() tenantId: string,
  ) {
    return this.ipdService.updateAdmission(id, dto, tenantId);
  }

  @Delete('admissions/:id/discharge')
  @Roles(UserRole.DOCTOR, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discharge patient' })
  @ApiResponse({ status: 200, description: 'Patient discharged successfully' })
  async dischargePatient(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.ipdService.dischargePatient(id, tenantId);
  }

  // ============= TREATMENT ENDPOINTS =============

  @Post('treatment')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Add treatment note' })
  @ApiResponse({ status: 201, description: 'Treatment added successfully' })
  async addTreatment(
    @Body() dto: CreateIPDTreatmentDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.ipdService.addTreatment(dto, tenantId, req.user.userId);
  }

  // ============= DISCHARGE SUMMARY ENDPOINTS =============

  @Post('discharge-summary')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Create discharge summary' })
  @ApiResponse({ status: 201, description: 'Discharge summary created successfully' })
  async createDischargeSummary(
    @Body() dto: CreateIPDDischargeSummaryDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.ipdService.createDischargeSummary(dto, tenantId, req.user.userId);
  }

  @Get('summary/:admissionId')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get admission summary' })
  @ApiResponse({ status: 200, description: 'Summary retrieved successfully' })
  async getAdmissionSummary(
    @Param('admissionId') admissionId: string,
    @TenantId() tenantId: string,
  ) {
    return this.ipdService.getAdmissionSummary(admissionId, tenantId);
  }

  // ============= STATS ENDPOINT =============

  @Get('stats')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get IPD statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.ipdService.getStats(tenantId);
  }
}

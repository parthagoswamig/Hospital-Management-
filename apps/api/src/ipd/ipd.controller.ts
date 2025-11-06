import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { IpdService } from './ipd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { UserRole } from '../core/rbac/enums/roles.enum';
import {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  UpdateBedStatusDto,
  WardFilterDto,
  BedFilterDto,
  CreateAdmissionDto,
  UpdateAdmissionDto,
  DischargePatientDto,
  TransferPatientDto,
  AdmissionFilterDto,
} from './dto';

@ApiTags('IPD')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('ipd')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IpdController {
  constructor(private readonly service: IpdService) {}

  // ==================== Ward Management ====================

  /**
   * Create a new ward
   */
  @Post('wards')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new ward',
    description:
      'Creates a new inpatient ward with specified capacity and type',
  })
  @ApiResponse({
    status: 201,
    description: 'Ward created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  createWard(
    @Body() createWardDto: CreateWardDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.createWard(createWardDto, tenantId);
  }

  /**
   * Get all wards with filters
   */
  @Get('wards')
  @ApiOperation({
    summary: 'Get all wards',
    description: 'Retrieves paginated list of wards with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Wards retrieved successfully',
  })
  findAllWards(@Query() filters: WardFilterDto, @TenantId() tenantId: string) {
    return this.service.findAllWards(tenantId, filters);
  }

  /**
   * Get ward by ID
   */
  @Get('wards/:id')
  @ApiOperation({
    summary: 'Get ward by ID',
    description:
      'Retrieves a specific ward with all its details including beds',
  })
  @ApiResponse({
    status: 200,
    description: 'Ward retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Ward not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Ward ID',
    example: 'ward-uuid-123',
  })
  findOneWard(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findOneWard(id, tenantId);
  }

  /**
   * Update ward
   */
  @Patch('wards/:id')
  @ApiOperation({
    summary: 'Update ward',
    description: 'Updates an existing ward',
  })
  @ApiResponse({
    status: 200,
    description: 'Ward updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Ward not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Ward ID',
    example: 'ward-uuid-123',
  })
  updateWard(
    @Param('id') id: string,
    @Body() updateWardDto: UpdateWardDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateWard(id, updateWardDto, tenantId);
  }

  // ==================== Bed Management ====================

  /**
   * Create a new bed
   */
  @Post('beds')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new bed',
    description: 'Creates a new bed within a specified ward',
  })
  @ApiResponse({
    status: 201,
    description: 'Bed created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Ward not found',
  })
  createBed(@Body() createBedDto: CreateBedDto, @TenantId() tenantId: string) {
    return this.service.createBed(createBedDto, tenantId);
  }

  /**
   * Get all beds with filters
   */
  @Get('beds')
  @ApiOperation({
    summary: 'Get all beds',
    description: 'Retrieves paginated list of beds with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Beds retrieved successfully',
  })
  findAllBeds(@Query() filters: BedFilterDto, @TenantId() tenantId: string) {
    return this.service.findAllBeds(tenantId, filters);
  }

  /**
   * Get available beds
   */
  @Get('beds/available')
  @ApiOperation({
    summary: 'Get available beds',
    description: 'Retrieves all available beds for new admissions',
  })
  @ApiResponse({
    status: 200,
    description: 'Available beds retrieved successfully',
  })
  findAvailableBeds(@TenantId() tenantId: string) {
    return this.service.findAvailableBeds(tenantId);
  }

  /**
   * Update bed status
   */
  @Patch('beds/:id/status')
  @ApiOperation({
    summary: 'Update bed status',
    description:
      'Updates the status of a specific bed (available, occupied, maintenance, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Bed status updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Bed not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Bed ID',
    example: 'bed-uuid-123',
  })
  updateBedStatus(
    @Param('id') id: string,
    @Body() updateBedStatusDto: UpdateBedStatusDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateBedStatus(id, updateBedStatusDto, tenantId);
  }

  // ==================== Admission Management ====================

  /**
   * Admit a patient
   */
  @Post('admissions')
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Admit a patient',
    description: 'Admits a patient to a specific bed',
  })
  @ApiResponse({
    status: 201,
    description: 'Patient admitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient, bed, or doctor not found',
  })
  createAdmission(
    @Body() createAdmissionDto: CreateAdmissionDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.createAdmission(createAdmissionDto, tenantId);
  }

  /**
   * Get all admissions with filters
   */
  @Get('admissions')
  @ApiOperation({
    summary: 'Get all admissions',
    description: 'Retrieves paginated list of admissions with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Admissions retrieved successfully',
  })
  findAllAdmissions(
    @Query() filters: AdmissionFilterDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.findAllAdmissions(tenantId, filters);
  }

  /**
   * Get admission by ID
   */
  @Get('admissions/:id')
  @ApiOperation({
    summary: 'Get admission by ID',
    description: 'Retrieves a specific admission with all details',
  })
  @ApiResponse({
    status: 200,
    description: 'Admission retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Admission not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Admission ID',
    example: 'admission-uuid-123',
  })
  findOneAdmission(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findOneAdmission(id, tenantId);
  }

  /**
   * Update admission
   */
  @Patch('admissions/:id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Update admission',
    description: 'Updates an existing admission',
  })
  @ApiResponse({
    status: 200,
    description: 'Admission updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Admission not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Admission ID',
    example: 'admission-uuid-123',
  })
  updateAdmission(
    @Param('id') id: string,
    @Body() updateAdmissionDto: UpdateAdmissionDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.updateAdmission(id, updateAdmissionDto, tenantId);
  }

  /**
   * Discharge patient
   */
  @Post('admissions/:id/discharge')
  @Roles(UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR)
  @ApiOperation({
    summary: 'Discharge patient',
    description: 'Discharges a patient and frees up the bed',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient discharged successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Admission not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Admission ID',
    example: 'admission-uuid-123',
  })
  dischargePatient(
    @Param('id') id: string,
    @Body() dischargeDto: DischargePatientDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.dischargePatient(id, dischargeDto, tenantId);
  }

  /**
   * Transfer patient to another bed
   */
  @Post('admissions/:id/transfer')
  @Roles(UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  @ApiOperation({
    summary: 'Transfer patient',
    description: 'Transfers a patient to a different bed/ward',
  })
  @ApiResponse({
    status: 200,
    description: 'Patient transferred successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Admission or new bed not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Admission ID',
    example: 'admission-uuid-123',
  })
  transferPatient(
    @Param('id') id: string,
    @Body() transferDto: TransferPatientDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.transferPatient(id, transferDto, tenantId);
  }

  /**
   * Get IPD statistics
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Get IPD statistics',
    description:
      'Retrieves IPD statistics including ward and bed occupancy rates',
  })
  @ApiResponse({
    status: 200,
    description: 'IPD statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }
}

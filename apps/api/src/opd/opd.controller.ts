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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { OpdService } from './opd.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../core/rbac/guards/tenant.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { UserRole } from '../core/rbac/enums/roles.enum';
import {
  CreateOPDVisitDto,
  UpdateOPDVisitDto,
  CreateOPDVitalsDto,
  CreateOPDPrescriptionDto,
  OPDVisitQueryDto,
} from './dto';

@ApiTags('OPD')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('opd')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  // ==================== OPD Visit Endpoints ====================

  /**
   * Create a new OPD visit
   */
  @Post('visits')
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Create a new OPD visit',
    description: 'Creates a new outpatient department visit for a patient',
  })
  @ApiResponse({
    status: 201,
    description: 'OPD visit created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid data provided',
  })
  @ApiResponse({
    status: 404,
    description: 'Patient or doctor not found',
  })
  async createVisit(
    @Body() createDto: CreateOPDVisitDto,
    @TenantId() tenantId: string,
    @Request() req: any,
  ) {
    return this.opdService.createVisit(createDto, tenantId, req.user.userId);
  }

  /**
   * Get all OPD visits with filters
   */
  @Get('visits')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Get all OPD visits',
    description: 'Retrieves paginated list of OPD visits with optional filters',
  })
  @ApiResponse({
    status: 200,
    description: 'OPD visits retrieved successfully',
  })
  async findAllVisits(
    @Query() query: OPDVisitQueryDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.findAllVisits(tenantId, query);
  }

  /**
   * Get OPD visit by ID
   */
  @Get('visits/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Get OPD visit by ID',
    description: 'Retrieves a specific OPD visit with all details',
  })
  @ApiParam({
    name: 'id',
    description: 'OPD visit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'OPD visit retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async findOneVisit(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.findOneVisit(id, tenantId);
  }

  /**
   * Update OPD visit
   */
  @Patch('visits/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Update OPD visit',
    description: 'Updates an existing OPD visit',
  })
  @ApiParam({
    name: 'id',
    description: 'OPD visit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'OPD visit updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async updateVisit(
    @Param('id') id: string,
    @Body() updateDto: UpdateOPDVisitDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.updateVisit(id, updateDto, tenantId);
  }

  /**
   * Delete OPD visit (soft delete)
   */
  @Delete('visits/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
  )
  @ApiOperation({
    summary: 'Delete OPD visit',
    description: 'Soft deletes an OPD visit by setting status to CANCELLED',
  })
  @ApiParam({
    name: 'id',
    description: 'OPD visit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 204,
    description: 'OPD visit deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async removeVisit(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.removeVisit(id, tenantId);
  }

  // ==================== OPD Vitals Endpoints ====================

  /**
   * Add vitals to an OPD visit
   */
  @Post('vitals')
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
  )
  @ApiOperation({
    summary: 'Add vitals to OPD visit',
    description: 'Records vital signs for an OPD visit',
  })
  @ApiResponse({
    status: 201,
    description: 'Vitals added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async addVitals(
    @Body() createDto: CreateOPDVitalsDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.addVitals(createDto, tenantId);
  }

  // ==================== OPD Prescription Endpoints ====================

  /**
   * Add prescription to an OPD visit
   */
  @Post('prescriptions')
  @HttpCode(HttpStatus.CREATED)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
  )
  @ApiOperation({
    summary: 'Add prescription to OPD visit',
    description: 'Adds a medication prescription to an OPD visit',
  })
  @ApiResponse({
    status: 201,
    description: 'Prescription added successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async addPrescription(
    @Body() createDto: CreateOPDPrescriptionDto,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.addPrescription(createDto, tenantId);
  }

  // ==================== Summary Endpoints ====================

  /**
   * Get complete visit summary
   */
  @Get('summary/:visitId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TENANT_ADMIN,
    UserRole.HOSPITAL_ADMIN,
    UserRole.DOCTOR,
    UserRole.NURSE,
    UserRole.RECEPTIONIST,
  )
  @ApiOperation({
    summary: 'Get visit summary',
    description: 'Retrieves complete summary of an OPD visit including vitals and prescriptions',
  })
  @ApiParam({
    name: 'visitId',
    description: 'OPD visit ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Visit summary retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'OPD visit not found',
  })
  async getVisitSummary(
    @Param('visitId') visitId: string,
    @TenantId() tenantId: string,
  ) {
    return this.opdService.getVisitSummary(visitId, tenantId);
  }
}

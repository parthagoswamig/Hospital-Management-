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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { UserRole } from '../core/rbac/enums/roles.enum';
import {
  CreateMedicationDto,
  UpdateMedicationDto,
  CreatePharmacyOrderDto,
  UpdatePharmacyOrderDto,
  UpdatePharmacyOrderItemDto,
  PharmacyOrderQueryDto,
  MedicationQueryDto,
} from './dto';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ==================== Medications Endpoints ====================

  @Post('medications')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Create a new medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMedication(
    @Body() createMedicationDto: CreateMedicationDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.createMedication(createMedicationDto, tenantId);
  }

  @Get('medications')
  @ApiOperation({ summary: 'Get all medications with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Medications retrieved successfully',
  })
  async findAllMedications(
    @TenantId() tenantId: string,
    @Query() query: MedicationQueryDto,
  ) {
    return this.pharmacyService.findAllMedications(tenantId, query);
  }

  @Get('medications/:id')
  @ApiOperation({ summary: 'Get medication by ID' })
  @ApiResponse({
    status: 200,
    description: 'Medication retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async findOneMedication(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.findOneMedication(id, tenantId);
  }

  @Patch('medications/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Update medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async updateMedication(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updateMedication(
      id,
      updateMedicationDto,
      tenantId,
    );
  }

  @Delete('medications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Soft delete medication by ID' })
  @ApiResponse({ status: 204, description: 'Medication deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async removeMedication(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.removeMedication(id, tenantId);
  }

  // ==================== Pharmacy Orders Endpoints ====================

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.DOCTOR, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Create a new pharmacy order' })
  @ApiResponse({
    status: 201,
    description: 'Pharmacy order created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPharmacyOrder(
    @Body() createPharmacyOrderDto: CreatePharmacyOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.createPharmacyOrder(
      createPharmacyOrderDto,
      tenantId,
    );
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all pharmacy orders with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy orders retrieved successfully',
  })
  async findAllPharmacyOrders(
    @TenantId() tenantId: string,
    @Query() query: PharmacyOrderQueryDto,
  ) {
    return this.pharmacyService.findAllPharmacyOrders(tenantId, query);
  }

  @Get('orders/stats')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getPharmacyStats(@TenantId() tenantId: string) {
    return this.pharmacyService.getPharmacyStats(tenantId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get pharmacy order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy order retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async findOnePharmacyOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.findOnePharmacyOrder(id, tenantId);
  }

  @Patch('orders/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Update pharmacy order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Pharmacy order updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async updatePharmacyOrder(
    @Param('id') id: string,
    @Body() updatePharmacyOrderDto: UpdatePharmacyOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updatePharmacyOrder(
      id,
      updatePharmacyOrderDto,
      tenantId,
    );
  }

  @Patch('orders/:orderId/items/:itemId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PHARMACIST, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update pharmacy order item status (Dispense)' })
  @ApiResponse({ status: 200, description: 'Order item updated successfully' })
  @ApiResponse({ status: 404, description: 'Order or item not found' })
  async updatePharmacyOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdatePharmacyOrderItemDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updatePharmacyOrderItem(
      orderId,
      itemId,
      updateItemDto,
      tenantId,
    );
  }

  @Delete('orders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.PHARMACIST)
  @ApiOperation({ summary: 'Cancel pharmacy order by ID' })
  @ApiResponse({
    status: 204,
    description: 'Pharmacy order cancelled successfully',
  })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async cancelPharmacyOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.cancelPharmacyOrder(id, tenantId);
  }

  // ==================== Additional Endpoints ====================

  @Get('medications/expiring')
  @ApiOperation({ summary: 'Get medications expiring soon' })
  @ApiResponse({
    status: 200,
    description: 'Expiring medications retrieved successfully',
  })
  async getExpiringMedications(
    @TenantId() tenantId: string,
    @Query('days') days?: number,
  ) {
    return this.pharmacyService.getExpiringMedications(tenantId, days || 30);
  }

  @Get('medications/low-stock')
  @ApiOperation({ summary: 'Get low stock medications' })
  @ApiResponse({
    status: 200,
    description: 'Low stock medications retrieved successfully',
  })
  async getLowStockMedications(@TenantId() tenantId: string) {
    return this.pharmacyService.getLowStockMedications(tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@TenantId() tenantId: string) {
    return this.pharmacyService.getPharmacyStats(tenantId);
  }
}

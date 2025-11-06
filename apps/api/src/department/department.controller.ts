import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantGuard } from '../core/rbac/guards/tenant.guard';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';

@ApiTags('Departments')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('departments')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(
    @Body() createDepartmentDto: CreateDepartmentDto,
    @TenantId() tenantId: string,
  ) {
    return this.departmentService.create(createDepartmentDto, tenantId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
  })
  async findAll(
    @TenantId() tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    const activeFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.departmentService.findAll(tenantId, activeFilter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.departmentService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Update department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @TenantId() tenantId: string,
  ) {
    return this.departmentService.update(id, updateDepartmentDto, tenantId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.SUPER_ADMIN, UserRole.TENANT_ADMIN, UserRole.HOSPITAL_ADMIN)
  @ApiOperation({ summary: 'Delete department by ID' })
  @ApiResponse({
    status: 204,
    description: 'Department deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.departmentService.remove(id, tenantId);
  }
}

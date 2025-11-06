import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiHeader,
} from '@nestjs/swagger';
import { PatientPortalService } from './patient-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { RolesGuard } from '../core/rbac/guards/roles.guard';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { UpdatePortalAccessDto } from './dto/portal-access.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { QueryDto } from '../shared/dto/query.dto';

@ApiTags('Patient Portal')
@ApiBearerAuth()
@ApiHeader({
  name: 'X-Tenant-Id',
  description: 'Tenant ID for multi-tenancy',
  required: true,
})
@Controller('patient-portal')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
export class PatientPortalController {
  constructor(private readonly service: PatientPortalService) {}

  @Get('my-profile')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  getProfile(@Req() req: AuthRequest) {
    return this.service.getProfile(req.user.id, req.user.tenantId);
  }

  @Patch('my-profile')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  updateProfile(
    @Body() updateDto: UpdatePortalAccessDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.updateProfile(
      req.user.id,
      updateDto,
      req.user.tenantId,
    );
  }

  @Get('my-appointments')
  @ApiOperation({ summary: 'Get patient appointments' })
  @ApiResponse({ status: 200, description: 'Appointments retrieved successfully' })
  getMyAppointments(@Req() req: AuthRequest) {
    return this.service.getMyAppointments(req.user.id, req.user.tenantId, {});
  }

  @Post('book-appointment')
  @ApiOperation({ summary: 'Book new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment booked successfully' })
  bookAppointment(
    @Body() createDto: BookAppointmentDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.bookAppointment(
      req.user.id,
      createDto,
      req.user.tenantId,
    );
  }

  @Get('my-medical-records')
  @ApiOperation({ summary: 'Get patient medical records' })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  getMyRecords(@Req() req: AuthRequest) {
    return this.service.getMyRecords(req.user.id, req.user.tenantId, {});
  }

  @Get('my-lab-results')
  @ApiOperation({ summary: 'Get patient lab results' })
  @ApiResponse({ status: 200, description: 'Lab results retrieved successfully' })
  getMyLabResults(@Req() req: AuthRequest) {
    return this.service.getMyLabResults(req.user.id, req.user.tenantId);
  }

  @Get('my-prescriptions')
  @ApiOperation({ summary: 'Get patient prescriptions' })
  @ApiResponse({ status: 200, description: 'Prescriptions retrieved successfully' })
  getMyPrescriptions(@Req() req: AuthRequest) {
    return this.service.getMyPrescriptions(req.user.id, req.user.tenantId);
  }

  @Get('my-invoices')
  @ApiOperation({ summary: 'Get patient invoices' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  getMyInvoices(@Req() req: AuthRequest) {
    return this.service.getMyInvoices(req.user.id, req.user.tenantId);
  }
}

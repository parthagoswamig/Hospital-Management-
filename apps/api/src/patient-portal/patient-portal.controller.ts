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
import { PatientPortalService } from './patient-portal.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { UpdatePortalAccessDto } from './dto/portal-access.dto';
import { BookAppointmentDto } from './dto/book-appointment.dto';
import { QueryDto } from '../shared/dto/query.dto';

@Controller('patient-portal')
@UseGuards(JwtAuthGuard)
export class PatientPortalController {
  constructor(private readonly service: PatientPortalService) {}

  @Get('my-profile')
  getProfile(@Req() req: AuthRequest) {
    return this.service.getProfile(req.user.id, req.user.tenantId);
  }

  @Patch('my-profile')
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
  getMyAppointments(@Req() req: AuthRequest) {
    return this.service.getMyAppointments(req.user.id, req.user.tenantId, {});
  }

  @Post('book-appointment')
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
  getMyRecords(@Req() req: AuthRequest) {
    return this.service.getMyRecords(req.user.id, req.user.tenantId, {});
  }

  @Get('my-lab-results')
  getMyLabResults(@Req() req: AuthRequest) {
    return this.service.getMyLabResults(req.user.id, req.user.tenantId);
  }

  @Get('my-prescriptions')
  getMyPrescriptions(@Req() req: AuthRequest) {
    return this.service.getMyPrescriptions(req.user.id, req.user.tenantId);
  }

  @Get('my-invoices')
  getMyInvoices(@Req() req: AuthRequest) {
    return this.service.getMyInvoices(req.user.id, req.user.tenantId);
  }
}

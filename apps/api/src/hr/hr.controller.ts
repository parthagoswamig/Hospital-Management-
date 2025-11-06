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
  Req,
} from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { QueryStaffDto } from './dto/query-staff.dto';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Post('staff')
  createStaff(@Body() createDto: CreateStaffDto, @Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.hrService.createStaff(createDto, tenantId);
  }

  @Get('staff')
  findAllStaff(@Req() req: AuthRequest, @Query() query: QueryStaffDto) {
    const tenantId = req.user.tenantId;
    return this.hrService.findAllStaff(tenantId, query);
  }

  @Get('staff/:id')
  findOneStaff(@Param('id') id: string, @Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.hrService.findOneStaff(id, tenantId);
  }

  @Patch('staff/:id')
  updateStaff(
    @Param('id') id: string,
    @Body() updateDto: UpdateStaffDto,
    @Req() req: AuthRequest,
  ) {
    const tenantId = req.user.tenantId;
    return this.hrService.updateStaff(id, updateDto, tenantId);
  }

  @Delete('staff/:id')
  removeStaff(@Param('id') id: string, @Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.hrService.removeStaff(id, tenantId);
  }

  @Get('departments')
  findAllDepartments(@Req() req: AuthRequest, @Query() query: QueryStaffDto) {
    const tenantId = req.user.tenantId;
    return this.hrService.findAllDepartments(tenantId, query);
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.hrService.getStats(tenantId);
  }

  @Get('attendance')
  getAttendance(@Req() req: AuthRequest, @Query() query: QueryStaffDto) {
    const tenantId = req.user.tenantId;
    return this.hrService.getAttendance(tenantId, query);
  }
}

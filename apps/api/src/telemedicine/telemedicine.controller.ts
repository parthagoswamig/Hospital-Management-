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
import { Request } from 'express';
import { TelemedicineService } from './telemedicine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTelemedicineDto } from './dto/create-telemedicine.dto';
import { UpdateTelemedicineDto } from './dto/update-telemedicine.dto';
import { QueryTelemedicineDto } from './dto/query-telemedicine.dto';

interface AuthRequest extends Request {
  user: {
    tenantId: string;
    userId: string;
  };
}

@Controller('telemedicine')
@UseGuards(JwtAuthGuard)
export class TelemedicineController {
  constructor(private readonly service: TelemedicineService) {}

  @Post('consultations')
  create(@Body() createDto: CreateTelemedicineDto, @Req() req: AuthRequest) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get('consultations')
  findAll(@Req() req: AuthRequest, @Query() query: QueryTelemedicineDto) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get('consultations/:id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch('consultations/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTelemedicineDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    return this.service.getStats(req.user.tenantId);
  }
}

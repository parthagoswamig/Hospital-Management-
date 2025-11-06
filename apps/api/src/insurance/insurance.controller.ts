import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { QueryClaimDto } from './dto/query-claim.dto';

@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(private readonly service: InsuranceService) {}

  @Post('claims')
  create(@Body() createDto: CreateClaimDto, @Req() req: AuthRequest) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get('claims')
  findAll(@Req() req: AuthRequest, @Query() query: QueryClaimDto) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get('claims/:id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch('claims/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateClaimDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Patch('claims/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() statusDto: { status: string },
    @Req() req: AuthRequest,
  ) {
    return this.service.updateStatus(id, statusDto.status, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    return this.service.getStats(req.user.tenantId);
  }
}

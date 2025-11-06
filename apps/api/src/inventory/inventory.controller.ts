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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { CreateInventoryItemDto } from './dto/create-item.dto';
import { UpdateInventoryItemDto } from './dto/update-item.dto';
import { QueryInventoryDto } from './dto/query-item.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post()
  create(@Body() createDto: CreateInventoryItemDto, @Req() req: AuthRequest) {
    return this.service.create(createDto, req.user.tenantId);
  }

  @Get()
  findAll(@Req() req: AuthRequest, @Query() query: QueryInventoryDto) {
    return this.service.findAll(req.user.tenantId, query);
  }

  @Get('low-stock')
  getLowStock(@Req() req: AuthRequest) {
    return this.service.getLowStock(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.findOne(id, req.user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, updateDto, req.user.tenantId);
  }

  @Patch(':id/adjust-stock')
  adjustStock(
    @Param('id') id: string,
    @Body() adjustDto: { quantity: number },
    @Req() req: AuthRequest,
  ) {
    return this.service.adjustStock(id, adjustDto.quantity, req.user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.service.remove(id, req.user.tenantId);
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest) {
    return this.service.getStats(req.user.tenantId);
  }
}

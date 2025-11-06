import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthRequest } from '../shared/types/auth-request.interface';
import { FinanceQueryDto } from './dto/finance-query.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoices
  @Get('invoices')
  findAllInvoices(@Req() req: AuthRequest, @Query() query: FinanceQueryDto) {
    const tenantId = req.user.tenantId;
    return this.financeService.findAllInvoices(tenantId, query);
  }

  @Get('invoices/:id')
  findOneInvoice(@Param('id') id: string, @Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.financeService.findOneInvoice(id, tenantId);
  }

  // Payments
  @Post('payments')
  createPayment(
    @Body() createDto: CreateTransactionDto,
    @Req() req: AuthRequest,
  ) {
    const tenantId = req.user.tenantId;
    return this.financeService.createPayment(createDto, tenantId);
  }

  @Get('payments')
  findAllPayments(@Req() req: AuthRequest, @Query() query: FinanceQueryDto) {
    const tenantId = req.user.tenantId;
    return this.financeService.findAllPayments(tenantId, query);
  }

  @Get('payments/:id')
  findOnePayment(@Param('id') id: string, @Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.financeService.findOnePayment(id, tenantId);
  }

  // Reports
  @Get('reports/revenue')
  getRevenueReport(@Req() req: AuthRequest, @Query() query: FinanceQueryDto) {
    const tenantId = req.user.tenantId;
    return this.financeService.getRevenueReport(tenantId, query);
  }

  @Get('reports/outstanding')
  getOutstandingReport(@Req() req: AuthRequest) {
    const tenantId = req.user.tenantId;
    return this.financeService.getOutstandingReport(tenantId);
  }

  @Get('stats')
  getStats(@Req() req: AuthRequest, @Query() query: FinanceQueryDto) {
    const tenantId = req.user.tenantId;
    return this.financeService.getStats(tenantId, query);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post('transaction')
  @ApiOperation({ summary: 'Create POS transaction' })
  createTransaction(@Body() createDto: any, @CurrentUser() user: any) {
    return this.salesService.createTransaction({
      ...createDto,
      userId: user.id,
    });
  }

  @Get('transactions/store/:storeId')
  @ApiOperation({ summary: 'Get transactions for store' })
  getTransactions(
    @Param('storeId') storeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
  ) {
    return this.salesService.getTransactions(storeId, {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    });
  }

  @Get('transaction/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  getTransaction(@Param('id') id: string) {
    return this.salesService.getTransaction(id);
  }

  @Post('transaction/:id/return')
  @ApiOperation({ summary: 'Create return' })
  createReturn(@Param('id') transactionId: string, @Body() returnDto: any) {
    return this.salesService.createReturn(transactionId, returnDto.items);
  }
}

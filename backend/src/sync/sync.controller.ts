import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Get('pending/:storeId')
  @ApiOperation({ summary: 'Get pending sync items' })
  getPending(@Param('storeId') storeId: string) {
    return this.syncService.getPendingSync(storeId);
  }

  @Post('queue')
  @ApiOperation({ summary: 'Queue sync item' })
  queueSync(@Body() data: any) {
    return this.syncService.queueSync(data);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch sync items' })
  batchSync(@Body() data: { storeId: string; items: any[] }) {
    return this.syncService.batchSync(data.storeId, data.items);
  }

  @Post('transactions')
  @ApiOperation({ summary: 'Sync transactions from POS' })
  syncTransactions(@Body() data: { storeId: string; transactions: any[] }) {
    return this.syncService.syncTransactions(data.storeId, data.transactions);
  }

  @Post('inventory')
  @ApiOperation({ summary: 'Sync inventory updates' })
  syncInventory(@Body() data: { storeId: string; inventory: any[] }) {
    return this.syncService.syncInventory(data.storeId, data.inventory);
  }
}

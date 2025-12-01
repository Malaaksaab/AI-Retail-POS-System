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
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('store/:storeId')
  @ApiOperation({ summary: 'Get inventory for store' })
  getInventory(@Param('storeId') storeId: string) {
    return this.inventoryService.getInventory(storeId);
  }

  @Get('store/:storeId/low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  getLowStock(
    @Param('storeId') storeId: string,
    @Query('threshold') threshold?: number,
  ) {
    return this.inventoryService.getLowStock(storeId, threshold);
  }

  @Post('adjust')
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVENTORY')
  @ApiOperation({ summary: 'Adjust inventory' })
  adjust(@Body() adjustDto: any, @CurrentUser() user: any) {
    return this.inventoryService.adjust({ ...adjustDto, userId: user.id });
  }

  @Post('transfer')
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVENTORY')
  @ApiOperation({ summary: 'Create stock transfer' })
  transfer(@Body() transferDto: any, @CurrentUser() user: any) {
    return this.inventoryService.transfer({
      ...transferDto,
      requestedBy: user.id,
    });
  }

  @Post('transfer/:id/approve')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Approve stock transfer' })
  approveTransfer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.approveTransfer(id, user.id);
  }

  @Post('transfer/:id/receive')
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVENTORY')
  @ApiOperation({ summary: 'Receive stock transfer' })
  receiveTransfer(@Param('id') id: string, @CurrentUser() user: any) {
    return this.inventoryService.receiveTransfer(id, user.id);
  }
}

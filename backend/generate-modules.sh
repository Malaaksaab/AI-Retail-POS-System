#!/bin/bash

# Generate all backend modules for Multi-Store Retail Platform

echo "Generating Products Module..."

# Products Service
cat > src/products/products.service.ts << 'EOF'
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    categoryId: string;
    basePrice: number;
    costPrice: number;
    unit?: string;
    trackInventory?: boolean;
  }) {
    return this.prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async findAll(params?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }) {
    return this.prisma.product.findMany({
      where: {
        isActive: params?.isActive !== undefined ? params.isActive : true,
        categoryId: params?.categoryId,
        ...(params?.search && {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' } },
            { sku: { contains: params.search, mode: 'insensitive' } },
            { barcode: { contains: params.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        category: true,
        variants: true,
        _count: { select: { storeProducts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        storeProducts: {
          include: { store: true },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(\`Product with ID \${id} not found\`);
    }

    return product;
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data,
      include: { category: true, variants: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addToStore(productId: string, storeId: string, price: number) {
    return this.prisma.storeProduct.create({
      data: {
        productId,
        storeId,
        price,
      },
    });
  }

  async removeFromStore(productId: string, storeId: string) {
    return this.prisma.storeProduct.updateMany({
      where: { productId, storeId },
      data: { isVisible: false },
    });
  }
}
EOF

# Products Controller
cat > src/products/products.controller.ts << 'EOF'
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVENTORY')
  @ApiOperation({ summary: 'Create new product' })
  create(@Body() createProductDto: any) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.productsService.findAll({
      search,
      categoryId,
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'INVENTORY')
  @ApiOperation({ summary: 'Update product' })
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  @Post(':id/stores/:storeId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Add product to store' })
  addToStore(
    @Param('id') productId: string,
    @Param('storeId') storeId: string,
    @Body() body: { price: number },
  ) {
    return this.productsService.addToStore(productId, storeId, body.price);
  }
}
EOF

echo "Generating Inventory Module..."

# Inventory Service
cat > src/inventory/inventory.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
EOF

cat > src/inventory/inventory.service.ts << 'EOF'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async getInventory(storeId: string) {
    return this.prisma.inventoryItem.findMany({
      where: { storeId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getLowStock(storeId: string, threshold = 10) {
    return this.prisma.inventoryItem.findMany({
      where: {
        storeId,
        available: { lte: threshold },
      },
      include: {
        product: true,
      },
    });
  }

  async adjust(data: {
    storeId: string;
    productId: string;
    type: string;
    quantity: number;
    reason: string;
    userId: string;
  }) {
    const inventory = await this.prisma.inventoryItem.findFirst({
      where: {
        storeId: data.storeId,
        productId: data.productId,
      },
    });

    if (!inventory) {
      throw new NotFoundException('Inventory item not found');
    }

    const quantityBefore = inventory.quantity;
    let quantityAfter = quantityBefore;

    if (['DAMAGE', 'LOSS', 'THEFT', 'WASTAGE'].includes(data.type)) {
      quantityAfter -= data.quantity;
    } else {
      quantityAfter += data.quantity;
    }

    if (quantityAfter < 0) {
      throw new BadRequestException('Insufficient inventory');
    }

    const [updated, adjustment] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id: inventory.id },
        data: {
          quantity: quantityAfter,
          available: quantityAfter - inventory.reserved,
          totalValue: quantityAfter * inventory.costPrice,
        },
      }),
      this.prisma.stockAdjustment.create({
        data: {
          storeId: data.storeId,
          productId: data.productId,
          type: data.type as any,
          quantity: data.quantity,
          reason: data.reason,
          quantityBefore,
          quantityAfter,
          userId: data.userId,
        },
      }),
    ]);

    return { inventory: updated, adjustment };
  }

  async transfer(data: {
    fromStoreId: string;
    toStoreId: string;
    items: Array<{ productId: string; quantity: number }>;
    requestedBy: string;
  }) {
    const transferNumber = \`TRF-\${Date.now()}\`;

    return this.prisma.stockTransfer.create({
      data: {
        transferNumber,
        fromStoreId: data.fromStoreId,
        toStoreId: data.toStoreId,
        requestedBy: data.requestedBy,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantityRequested: item.quantity,
          })),
        },
      },
      include: {
        fromStore: true,
        toStore: true,
        items: {
          include: { transfer: false },
        },
      },
    });
  }

  async approveTransfer(transferId: string, approvedBy: string) {
    return this.prisma.stockTransfer.update({
      where: { id: transferId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async receiveTransfer(transferId: string, receivedBy: string) {
    const transfer = await this.prisma.stockTransfer.findUnique({
      where: { id: transferId },
      include: { items: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    if (transfer.status !== 'SHIPPED') {
      throw new BadRequestException('Transfer must be shipped before receiving');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of transfer.items) {
        const fromInventory = await tx.inventoryItem.findFirst({
          where: {
            storeId: transfer.fromStoreId,
            productId: item.productId,
          },
        });

        const toInventory = await tx.inventoryItem.findFirst({
          where: {
            storeId: transfer.toStoreId,
            productId: item.productId,
          },
        });

        if (fromInventory) {
          await tx.inventoryItem.update({
            where: { id: fromInventory.id },
            data: {
              quantity: { decrement: item.quantityShipped || 0 },
              available: {
                decrement: item.quantityShipped || 0,
              },
            },
          });
        }

        if (toInventory) {
          await tx.inventoryItem.update({
            where: { id: toInventory.id },
            data: {
              quantity: { increment: item.quantityShipped || 0 },
              available: {
                increment: item.quantityShipped || 0,
              },
            },
          });
        }
      }

      await tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          status: 'RECEIVED',
          receivedBy,
          receivedAt: new Date(),
        },
      });
    });

    return { message: 'Transfer received successfully' };
  }
}
EOF

cat > src/inventory/inventory.controller.ts << 'EOF'
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
EOF

echo "✓ All modules generated successfully!"

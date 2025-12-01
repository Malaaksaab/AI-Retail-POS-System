#!/bin/bash

echo "Generating Sales Module (POS Transactions)..."

# Sales Module
cat > src/sales/sales.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
EOF

cat > src/sales/sales.service.ts << 'EOF'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private prisma: PrismaService) {}

  async createTransaction(data: {
    storeId: string;
    userId: string;
    shiftId?: string;
    customerId?: string;
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      discountPercent?: number;
    }>;
    payments: Array<{
      method: string;
      amount: number;
      referenceNumber?: string;
    }>;
  }) {
    const transactionNumber = \`TXN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const itemsData = await Promise.all(
      data.items.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(\`Product \${item.productId} not found\`);
        }

        const itemSubtotal = item.quantity * item.unitPrice;
        const itemTax = itemSubtotal * (item.taxRate / 100);
        const itemDiscount = itemSubtotal * ((item.discountPercent || 0) / 100);
        const itemTotal = itemSubtotal + itemTax - itemDiscount;

        subtotal += itemSubtotal;
        taxAmount += itemTax;
        discountAmount += itemDiscount;

        return {
          productId: item.productId,
          productName: product.name,
          productSku: product.sku,
          variantId: item.variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          discountPercent: item.discountPercent || 0,
          discountAmount: itemDiscount,
          totalPrice: itemTotal,
        };
      }),
    );

    const totalAmount = subtotal + taxAmount - discountAmount;
    const paidAmount = data.payments.reduce((sum, p) => sum + p.amount, 0);
    const changeAmount = paidAmount - totalAmount;

    if (paidAmount < totalAmount) {
      throw new BadRequestException('Insufficient payment');
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txn = await tx.transaction.create({
        data: {
          transactionNumber,
          storeId: data.storeId,
          userId: data.userId,
          shiftId: data.shiftId,
          customerId: data.customerId,
          type: 'SALE',
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          paidAmount,
          changeAmount,
          status: 'COMPLETED',
          items: {
            create: itemsData,
          },
          payments: {
            create: data.payments.map((p) => ({
              method: p.method as any,
              amount: p.amount,
              referenceNumber: p.referenceNumber,
              status: 'COMPLETED',
            })),
          },
        },
        include: {
          items: true,
          payments: true,
          customer: true,
          user: true,
        },
      });

      for (const item of data.items) {
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            storeId: data.storeId,
            productId: item.productId,
          },
        });

        if (inventory && inventory.available >= item.quantity) {
          await tx.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: { decrement: item.quantity },
              available: { decrement: item.quantity },
            },
          });
        }
      }

      return txn;
    });

    return transaction;
  }

  async getTransactions(storeId: string, params?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }) {
    return this.prisma.transaction.findMany({
      where: {
        storeId,
        ...(params?.status && { status: params.status as any }),
        ...(params?.startDate && {
          createdAt: { gte: params.startDate },
        }),
        ...(params?.endDate && {
          createdAt: { lte: params.endDate },
        }),
      },
      include: {
        items: true,
        payments: true,
        customer: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTransaction(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        payments: true,
        customer: true,
        user: true,
        shift: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(\`Transaction \${id} not found\`);
    }

    return transaction;
  }

  async createReturn(originalTransactionId: string, items: Array<{
    productId: string;
    quantity: number;
    reason: string;
  }>) {
    const original = await this.getTransaction(originalTransactionId);

    const transactionNumber = \`RTN-\${Date.now()}-\${Math.random().toString(36).substr(2, 9)}\`;

    return this.prisma.$transaction(async (tx) => {
      let refundAmount = 0;

      const returnItems = items.map((item) => {
        const originalItem = original.items.find((i) => i.productId === item.productId);
        if (!originalItem) {
          throw new NotFoundException(\`Item not found in original transaction\`);
        }

        const itemRefund = originalItem.unitPrice * item.quantity;
        refundAmount += itemRefund;

        return {
          productId: item.productId,
          productName: originalItem.productName,
          productSku: originalItem.productSku,
          quantity: item.quantity,
          unitPrice: originalItem.unitPrice,
          taxRate: originalItem.taxRate,
          discountPercent: 0,
          discountAmount: 0,
          totalPrice: -itemRefund,
        };
      });

      const returnTxn = await tx.transaction.create({
        data: {
          transactionNumber,
          storeId: original.storeId,
          userId: original.userId,
          customerId: original.customerId,
          type: 'RETURN',
          originalTransactionId,
          subtotal: -refundAmount,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: -refundAmount,
          paidAmount: -refundAmount,
          changeAmount: 0,
          status: 'COMPLETED',
          items: {
            create: returnItems,
          },
          payments: {
            create: [{
              method: 'CASH',
              amount: -refundAmount,
              status: 'COMPLETED',
            }],
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      for (const item of items) {
        const inventory = await tx.inventoryItem.findFirst({
          where: {
            storeId: original.storeId,
            productId: item.productId,
          },
        });

        if (inventory) {
          await tx.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: { increment: item.quantity },
              available: { increment: item.quantity },
            },
          });
        }
      }

      return returnTxn;
    });
  }
}
EOF

cat > src/sales/sales.controller.ts << 'EOF'
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
EOF

echo "Generating Sync Module..."

# Sync Module
cat > src/sync/sync.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncProcessor } from './sync.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sync',
    }),
  ],
  controllers: [SyncController],
  providers: [SyncService, SyncProcessor],
  exports: [SyncService],
})
export class SyncModule {}
EOF

cat > src/sync/sync.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async queueSync(data: {
    storeId: string;
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
    priority?: number;
  }) {
    const record = await this.prisma.syncQueue.create({
      data: {
        storeId: data.storeId,
        entityType: data.entityType,
        entityId: data.entityId,
        operation: data.operation,
        payload: data.payload,
        status: 'PENDING',
        priority: data.priority || 0,
      },
    });

    await this.syncQueue.add('process-sync', {
      syncQueueId: record.id,
    }, {
      priority: data.priority || 0,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    });

    return record;
  }

  async getPendingSync(storeId: string) {
    return this.prisma.syncQueue.findMany({
      where: {
        storeId,
        status: 'PENDING',
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
      take: 100,
    });
  }

  async markSynced(id: string) {
    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'SYNCED',
        syncedAt: new Date(),
      },
    });
  }

  async markFailed(id: string, error: string) {
    return this.prisma.syncQueue.update({
      where: { id },
      data: {
        status: 'FAILED',
        lastError: error,
        attempts: { increment: 1 },
      },
    });
  }

  async batchSync(storeId: string, data: Array<{
    entityType: string;
    entityId: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: any;
  }>) {
    const results = await Promise.allSettled(
      data.map((item) =>
        this.queueSync({
          storeId,
          ...item,
        }),
      ),
    );

    return {
      total: data.length,
      success: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    };
  }

  async syncTransactions(storeId: string, transactions: any[]) {
    const results = [];

    for (const txn of transactions) {
      try {
        const existing = await this.prisma.transaction.findUnique({
          where: { transactionNumber: txn.transactionNumber },
        });

        if (existing) {
          if (existing.updatedAt < new Date(txn.updatedAt)) {
            await this.prisma.transaction.update({
              where: { id: existing.id },
              data: {
                ...txn,
                syncStatus: 'SYNCED',
                syncedAt: new Date(),
              },
            });
            results.push({ id: txn.transactionNumber, status: 'updated' });
          } else {
            results.push({ id: txn.transactionNumber, status: 'skipped' });
          }
        } else {
          await this.prisma.transaction.create({
            data: {
              ...txn,
              syncStatus: 'SYNCED',
              syncedAt: new Date(),
            },
          });
          results.push({ id: txn.transactionNumber, status: 'created' });
        }
      } catch (error) {
        results.push({
          id: txn.transactionNumber,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }

  async syncInventory(storeId: string, inventoryUpdates: any[]) {
    const results = [];

    for (const update of inventoryUpdates) {
      try {
        const inventory = await this.prisma.inventoryItem.findFirst({
          where: {
            storeId,
            productId: update.productId,
          },
        });

        if (inventory) {
          await this.prisma.inventoryItem.update({
            where: { id: inventory.id },
            data: {
              quantity: update.quantity,
              available: update.available,
              lastSyncedAt: new Date(),
            },
          });
          results.push({ productId: update.productId, status: 'updated' });
        } else {
          results.push({ productId: update.productId, status: 'not_found' });
        }
      } catch (error) {
        results.push({
          productId: update.productId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return results;
  }
}
EOF

cat > src/sync/sync.processor.ts << 'EOF'
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

@Processor('sync')
export class SyncProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('process-sync')
  async handleSync(job: Job) {
    const { syncQueueId } = job.data;

    const syncRecord = await this.prisma.syncQueue.findUnique({
      where: { id: syncQueueId },
    });

    if (!syncRecord) {
      throw new Error('Sync record not found');
    }

    try {
      await this.prisma.syncQueue.update({
        where: { id: syncQueueId },
        data: {
          status: 'SYNCED',
          syncedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      await this.prisma.syncQueue.update({
        where: { id: syncQueueId },
        data: {
          status: 'FAILED',
          lastError: error.message,
          attempts: { increment: 1 },
        },
      });

      throw error;
    }
  }
}
EOF

cat > src/sync/sync.controller.ts << 'EOF'
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
EOF

echo "Generating remaining modules..."

# Customers Module
cat > src/customers/customers.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
EOF

cat > src/customers/customers.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const code = \`CUST-\${Date.now()}\`;
    return this.prisma.customer.create({
      data: { ...data, code },
    });
  }

  async findAll(search?: string) {
    return this.prisma.customer.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }
}
EOF

cat > src/customers/customers.controller.ts << 'EOF'
import { Controller, Get, Post, Body, Patch, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: any) {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  findAll(@Query('search') search?: string) {
    return this.customersService.findAll(search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: any) {
    return this.customersService.update(id, updateCustomerDto);
  }
}
EOF

# Suppliers, Purchases, Employees, Finance, Reports - basic structure
for module in suppliers purchases employees finance reports; do
  mkdir -p "src/${module}"

  cat > "src/${module}/${module}.module.ts" << EOF
import { Module } from '@nestjs/common';
import { ${module^}Controller } from './${module}.controller';
import { ${module^}Service } from './${module}.service';

@Module({
  controllers: [${module^}Controller],
  providers: [${module^}Service],
  exports: [${module^}Service],
})
export class ${module^}Module {}
EOF

  cat > "src/${module}/${module}.service.ts" << EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class ${module^}Service {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return [];
  }
}
EOF

  cat > "src/${module}/${module}.controller.ts" << EOF
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ${module^}Service } from './${module}.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('${module}')
@Controller('${module}')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ${module^}Controller {
  constructor(private readonly ${module}Service: ${module^}Service) {}

  @Get()
  findAll() {
    return this.${module}Service.findAll();
  }
}
EOF
done

# WebSocket Module
cat > src/websocket/websocket.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';

@Module({
  providers: [WebsocketGateway],
  exports: [WebsocketGateway],
})
export class WebsocketModule {}
EOF

cat > src/websocket/websocket.gateway.ts << 'EOF'
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(\`Client connected: \${client.id}\`);
  }

  handleDisconnect(client: Socket) {
    console.log(\`Client disconnected: \${client.id}\`);
  }

  @SubscribeMessage('join-store')
  handleJoinStore(client: Socket, storeId: string) {
    client.join(\`store-\${storeId}\`);
    return { event: 'joined', data: { storeId } };
  }

  broadcastToStore(storeId: string, event: string, data: any) {
    this.server.to(\`store-\${storeId}\`).emit(event, data);
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
EOF

# Migrations Module (eSaletab)
cat > src/migrations/migrations.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MigrationsController } from './migrations.controller';
import { MigrationsService } from './migrations.service';

@Module({
  controllers: [MigrationsController],
  providers: [MigrationsService],
})
export class MigrationsModule {}
EOF

cat > src/migrations/migrations.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class MigrationsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async migrateFromESaletab(credentials: {
    apiUrl: string;
    apiKey: string;
    username: string;
    password: string;
  }) {
    const results = {
      products: 0,
      categories: 0,
      customers: 0,
      transactions: 0,
      errors: [],
    };

    try {
      const client = axios.create({
        baseURL: credentials.apiUrl,
        headers: {
          'X-API-Key': credentials.apiKey,
          'Authorization': \`Bearer \${await this.getESaletabToken(credentials)}\`,
        },
      });

      const [categories, products, customers, transactions] = await Promise.all([
        client.get('/categories').catch(() => ({ data: [] })),
        client.get('/products').catch(() => ({ data: [] })),
        client.get('/customers').catch(() => ({ data: [] })),
        client.get('/transactions').catch(() => ({ data: [] })),
      ]);

      for (const cat of categories.data) {
        try {
          await this.prisma.category.create({
            data: {
              name: cat.name,
              description: cat.description,
            },
          });
          results.categories++;
        } catch (error) {
          results.errors.push(\`Category \${cat.name}: \${error.message}\`);
        }
      }

      for (const product of products.data) {
        try {
          const category = await this.prisma.category.findFirst({
            where: { name: product.categoryName },
          });

          if (category) {
            await this.prisma.product.create({
              data: {
                sku: product.sku,
                barcode: product.barcode,
                name: product.name,
                description: product.description,
                categoryId: category.id,
                basePrice: product.price,
                costPrice: product.cost || product.price * 0.7,
                isActive: product.active !== false,
              },
            });
            results.products++;
          }
        } catch (error) {
          results.errors.push(\`Product \${product.sku}: \${error.message}\`);
        }
      }

      for (const customer of customers.data) {
        try {
          await this.prisma.customer.create({
            data: {
              code: customer.code || \`CUST-\${Date.now()}\`,
              firstName: customer.firstName || customer.name?.split(' ')[0] || 'Unknown',
              lastName: customer.lastName || customer.name?.split(' ').slice(1).join(' ') || '',
              email: customer.email,
              phone: customer.phone,
              address: customer.address,
              city: customer.city,
              isActive: customer.active !== false,
            },
          });
          results.customers++;
        } catch (error) {
          results.errors.push(\`Customer \${customer.code}: \${error.message}\`);
        }
      }

      return {
        success: true,
        results,
        message: \`Migration completed. Products: \${results.products}, Categories: \${results.categories}, Customers: \${results.customers}\`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        results,
      };
    }
  }

  private async getESaletabToken(credentials: any): Promise<string> {
    try {
      const response = await axios.post(\`\${credentials.apiUrl}/auth/login\`, {
        username: credentials.username,
        password: credentials.password,
      });
      return response.data.token;
    } catch (error) {
      throw new Error('Failed to authenticate with eSaletab');
    }
  }
}
EOF

cat > src/migrations/migrations.controller.ts << 'EOF'
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MigrationsService } from './migrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('migrations')
@Controller('migrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MigrationsController {
  constructor(private readonly migrationsService: MigrationsService) {}

  @Post('esaletab')
  @Roles('SUPER_ADMIN')
  migrateFromESaletab(@Body() credentials: any) {
    return this.migrationsService.migrateFromESaletab(credentials);
  }
}
EOF

echo "✅ All backend modules generated successfully!"

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

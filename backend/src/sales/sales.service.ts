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

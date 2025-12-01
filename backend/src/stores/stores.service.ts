import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class StoresService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    code: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    email: string;
    taxRate?: number;
    currency?: string;
  }) {
    return this.prisma.store.create({
      data,
    });
  }

  async findAll(params?: { isActive?: boolean }) {
    return this.prisma.store.findMany({
      where: params?.isActive !== undefined ? { isActive: params.isActive } : {},
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            transactions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            products: true,
            inventory: true,
            transactions: true,
            shifts: true,
          },
        },
      },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  async update(id: string, data: Partial<{
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    taxRate: number;
    isActive: boolean;
  }>) {
    const store = await this.findOne(id);

    return this.prisma.store.update({
      where: { id: store.id },
      data,
    });
  }

  async remove(id: string) {
    const store = await this.findOne(id);

    return this.prisma.store.update({
      where: { id: store.id },
      data: { isActive: false },
    });
  }

  async getStats(storeId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalSalesToday,
      totalSales,
      totalTransactions,
      activeProducts,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          storeId,
          createdAt: { gte: today },
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          storeId,
          status: 'COMPLETED',
        },
        _sum: { totalAmount: true },
        _count: true,
      }),
      this.prisma.transaction.count({
        where: { storeId },
      }),
      this.prisma.storeProduct.count({
        where: { storeId, isAvailable: true },
      }),
      this.prisma.inventoryItem.count({
        where: {
          storeId,
          available: { lte: 10 },
        },
      }),
    ]);

    return {
      salesToday: totalSalesToday._sum.totalAmount || 0,
      totalSales: totalSales._sum.totalAmount || 0,
      totalTransactions: totalTransactions,
      activeProducts,
      lowStockProducts,
    };
  }
}

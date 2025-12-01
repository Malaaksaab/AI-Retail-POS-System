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

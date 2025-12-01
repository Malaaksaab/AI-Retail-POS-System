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

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { user, method, url, body, ip, headers } = request;

    const actionMap = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
    };

    const action = actionMap[method] || 'READ';

    return next.handle().pipe(
      tap(async (data) => {
        if (action !== 'READ' && user) {
          try {
            await this.prisma.auditLog.create({
              data: {
                userId: user.id,
                action: `${action}_${this.extractEntity(url)}`,
                entityType: this.extractEntity(url),
                entityId: data?.id || null,
                changes: body,
                ipAddress: ip,
                userAgent: headers['user-agent'],
              },
            });
          } catch (error) {
            console.error('Audit log error:', error);
          }
        }
      }),
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'unknown';
  }
}

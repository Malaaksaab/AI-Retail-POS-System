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

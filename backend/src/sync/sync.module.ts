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

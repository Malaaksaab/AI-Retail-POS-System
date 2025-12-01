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

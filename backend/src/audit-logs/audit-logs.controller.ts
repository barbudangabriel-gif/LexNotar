import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AuditLogsService } from './audit-logs.service';
import { GetAuditLogsDto } from './dto/get-audit-logs.dto';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles('ADMIN', 'NOTAR')
  findAll(@Query() filters: GetAuditLogsDto) {
    return this.auditLogsService.findAll(filters);
  }

  @Get('statistics')
  @Roles('ADMIN')
  getStatistics() {
    return this.auditLogsService.getStatistics();
  }
}

import {
  Controller, Get, Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
    @Query('action') action?: string,
  ) {
    return this.service.findAll(
      page ? +page : 1,
      limit ? +limit : 50,
      { employeeId: employeeId ? +employeeId : undefined, action },
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}

import {
  Controller, Get, Patch, Body,
  Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class AttendanceSessionsController {
  constructor(private readonly service: AttendanceSessionsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('employeeId') employeeId?: string,
    @Query('date') date?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(
      page ? +page : 1,
      limit ? +limit : 20,
      { employeeId: employeeId ? +employeeId : undefined, date, status },
    );
  }

  @Get('session/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch('session/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAttendanceDto) {
    return this.service.update(id, dto);
  }
}

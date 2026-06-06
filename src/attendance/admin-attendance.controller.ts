import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { GenerateQrDto } from './dto/generate-qr.dto';
import { AttendanceReportDto } from './dto/attendance-report.dto';

@Controller('admin/attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('generate-qr')
  @Roles(Role.ADMIN)
  generateQr(@CurrentUser() user: any, @Body() dto: GenerateQrDto) {
    return this.attendanceService.generateQr(user.id, dto.purpose);
  }

  @Get('qr-status/:id')
  @Roles(Role.ADMIN)
  getQrStatus(@Param('id') id: string) {
    return this.attendanceService.getQrStatus(+id);
  }

  @Get('report')
  @Roles(Role.ADMIN, Role.MANAGER)
  getReport(@Query() dto: AttendanceReportDto) {
    return this.attendanceService.getReport(dto);
  }
}
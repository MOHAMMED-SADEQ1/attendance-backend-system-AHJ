import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AttendanceService } from './attendance.service';
import { ScanQrDto } from './dto/scan-qr.dto';
import { Employee } from '../employees/employee.entity';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.EMPLOYEE, Role.MANAGER)
export class EmployeeAttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@CurrentUser() user: Employee, @Body() dto: ScanQrDto) {
    return this.attendanceService.checkIn(user.id, dto.qrCode);
  }

  @Post('check-out')
  checkOut(@CurrentUser() user: Employee, @Body() dto: ScanQrDto) {
    return this.attendanceService.checkOut(user.id, dto.qrCode);
  }

  @Get('today')
  getToday(@CurrentUser() user: Employee) {
    return this.attendanceService.getTodayStatus(user.id);
  }

  @Get('history')
  getHistory(
    @CurrentUser() user: Employee,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.attendanceService.getHistory(
      user.id,
      page ? +page : 1,
      limit ? +limit : 20,
    );
  }
}

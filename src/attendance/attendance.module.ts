import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAttendanceController } from './admin-attendance.controller';
import { EmployeeAttendanceController } from './employee-attendance.controller';
import { AttendanceService } from './attendance.service';
import { CheckoutCronService } from './checkout-cron.service';
import { QrDynamicToken } from '../admin/entities/qr-dynamic-token.entity';
import { AttendanceSession } from '../admin/entities/attendance-session.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { ShiftPolicy } from '../admin/entities/shift-policy.entity';
import { Employee } from '../employees/employee.entity';
import { SystemSetting } from '../admin/entities/system-setting.entity';
import { Holiday } from '../admin/entities/holiday.entity';
import { LeaveRequest } from '../admin/entities/leave-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QrDynamicToken, AttendanceSession, AuditLog, ShiftPolicy, Employee, SystemSetting, Holiday, LeaveRequest]),
  ],
  controllers: [AdminAttendanceController, EmployeeAttendanceController],
  providers: [AttendanceService, CheckoutCronService],
  exports: [AttendanceService],
})
export class AttendanceModule {}

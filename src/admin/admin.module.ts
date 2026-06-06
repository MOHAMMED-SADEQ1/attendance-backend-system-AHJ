import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { ShiftPoliciesController } from './shift-policies.controller';
import { ShiftPoliciesService } from './shift-policies.service';
import { LeavesController } from './leaves.controller';
import { LeavesService } from './leaves.service';
import { EmployeesAdminController } from './employees-admin.controller';
import { EmployeesAdminService } from './employees-admin.service';
import { DashboardController } from './dashboard.controller';
import { SettingsController } from './settings.controller';
import { QrLocationsController } from './qr-locations.controller';
import { QrLocationsService } from './qr-locations.service';
import { AttendanceSessionsController } from './attendance-sessions.controller';
import { AttendanceSessionsService } from './attendance-sessions.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { UserSessionsController } from './user-sessions.controller';
import { HolidaysController } from './holidays.controller';
import { HolidaysService } from './holidays.service';
import { Holiday } from './entities/holiday.entity';
import { Department } from './entities/department.entity';
import { ShiftPolicy } from './entities/shift-policy.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { SystemSetting } from './entities/system-setting.entity';
import { QrStaticLocation } from './entities/qr-static-location.entity';
import { AttendanceSession } from './entities/attendance-session.entity';
import { QrDynamicToken } from './entities/qr-dynamic-token.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Employee } from '../employees/employee.entity';
import { UserSession } from '../user-sessions/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department, ShiftPolicy, LeaveRequest, SystemSetting, Holiday,
      QrStaticLocation, AttendanceSession, QrDynamicToken, AuditLog,
      Employee, UserSession,
    ]),
  ],
  controllers: [
    DepartmentsController,
    ShiftPoliciesController,
    LeavesController,
    EmployeesAdminController,
    DashboardController,
    SettingsController,
    QrLocationsController,
    AttendanceSessionsController,
    AuditLogsController,
    UserSessionsController,
    HolidaysController,
  ],
  providers: [
    DepartmentsService,
    ShiftPoliciesService,
    LeavesService,
    EmployeesAdminService,
    QrLocationsService,
    AttendanceSessionsService,
    AuditLogsService,
    HolidaysService,
  ],
})
export class AdminModule {}

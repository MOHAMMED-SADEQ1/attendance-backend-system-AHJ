import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { AttendanceSession } from '../admin/entities/attendance-session.entity';
import { Employee } from '../employees/employee.entity';
import { ShiftPolicy } from '../admin/entities/shift-policy.entity';
import { SystemSetting } from '../admin/entities/system-setting.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';

@Injectable()
export class CheckoutCronService {
  private readonly logger = new Logger(CheckoutCronService.name);

  constructor(
    @InjectRepository(AttendanceSession)
    private readonly attendanceRepo: Repository<AttendanceSession>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(ShiftPolicy)
    private readonly shiftPolicyRepo: Repository<ShiftPolicy>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepo: Repository<SystemSetting>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoCloseStaleSessions() {
    const graceHours = await this.getGraceHours();

    const openSessions = await this.attendanceRepo.find({
      where: { checkInTime: Not(IsNull()), checkOutTime: IsNull() },
    });

    for (const session of openSessions) {
      try {
        await this.processSession(session, graceHours);
      } catch (err) {
        this.logger.error(`Session ${session.id}: ${err.message}`);
      }
    }
  }

  private async getGraceHours(): Promise<number> {
    const setting = await this.systemSettingRepo.findOne({
      where: { settingKey: 'auto_checkout_grace_hours' }
    });
    return setting ? parseInt(setting.settingValue, 10) || 2 : 2;
  }

  private async processSession(session: AttendanceSession, graceHours: number) {
    const employee = await this.employeeRepo.findOne({
      where: { id: session.employeeId },
    });

    if (!employee?.shiftPolicyId) return;

    const shiftPolicy = await this.shiftPolicyRepo.findOne({
      where: { id: employee.shiftPolicyId }
    });

    if (!shiftPolicy) return;

    const checkInTime = new Date(session.checkInTime!);
    const expectedEnd = this.calculateExpectedEnd(checkInTime, shiftPolicy);
    const now = new Date();
    const diffHours = (now.getTime() - expectedEnd.getTime()) / (1000 * 60 * 60);

    if (diffHours < graceHours) return;

    const diffWorkingMs = expectedEnd.getTime() - checkInTime.getTime();
    let hoursWorked = Math.round((diffWorkingMs / (1000 * 60 * 60)) * 100) / 100;

    let breakDuration = 0;
    if (shiftPolicy.breakDuration) {
      breakDuration = shiftPolicy.breakDuration / 60;
    }
    hoursWorked = Math.round((hoursWorked - breakDuration) * 100) / 100;
    if (hoursWorked < 0) hoursWorked = 0;

    session.checkOutTime = expectedEnd;
    session.checkOutMethod = 'AUTO_CLOSE';
    session.calculatedHours = hoursWorked;
    await this.attendanceRepo.save(session);

    await this.auditLogRepo.save({
      employeeId: session.employeeId,
      action: 'AUTO_CHECK_OUT',
      details: {
        sessionId: session.id,
        checkInTime: session.checkInTime,
        checkOutTime: expectedEnd,
        calculatedHours: hoursWorked,
        reason: 'انصراف تلقائي بعد تجاوز مهلة الانتظار',
      },
    });

    this.logger.log(`Session ${session.id} auto-closed (emp ${session.employeeId})`);
  }

  private calculateExpectedEnd(checkInTime: Date, shiftPolicy: ShiftPolicy): Date {
    const [startH, startM] = shiftPolicy.startTime.split(':').map(Number);
    const [endH, endM] = shiftPolicy.endTime.split(':').map(Number);

    let durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (durationMinutes <= 0) durationMinutes += 24 * 60;

    return new Date(checkInTime.getTime() + durationMinutes * 60 * 1000);
  }
}

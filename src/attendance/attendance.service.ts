import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, Between, LessThanOrEqual, MoreThanOrEqual, Like } from 'typeorm';
import * as crypto from 'crypto';
import { QrDynamicToken } from '../admin/entities/qr-dynamic-token.entity';
import { AttendanceSession } from '../admin/entities/attendance-session.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { Employee } from '../employees/employee.entity';
import { ShiftPolicy } from '../admin/entities/shift-policy.entity';
import { SystemSetting } from '../admin/entities/system-setting.entity';
import { Holiday } from '../admin/entities/holiday.entity';
import { LeaveRequest } from '../admin/entities/leave-request.entity';
import { AttendanceReportDto } from './dto/attendance-report.dto';
import { Role } from '../common/enums/role.enum';

const DAY_NAMES: Record<string, string> = {
  SUNDAY: 'الأحد', MONDAY: 'الإثنين', TUESDAY: 'الثلاثاء',
  WEDNESDAY: 'الأربعاء', THURSDAY: 'الخميس', FRIDAY: 'الجمعة', SATURDAY: 'السبت',
};

const LEAVE_TYPE_NAMES: Record<string, string> = {
  ANNUAL: 'سنوية', SICK: 'مرضية', EMERGENCY: 'طارئة', UNPAID: 'بدون راتب', OTHER: 'أخرى',
};

@Injectable()
export class AttendanceService {
  private toRiyadhISO(date: Date | null): string | null {
    if (!date) return null;
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Riyadh',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    }).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
    return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}+03:00`;
  }

  private getTodayRiyadh(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Riyadh' });
  }

  private getDayNameRiyadh(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const name = dt.toLocaleDateString('en-US', { timeZone: 'Asia/Riyadh', weekday: 'long' }).toUpperCase();
    return DAY_NAMES[name] || name;
  }

  private to60Format(decimalHours: number | null): string | null {
    if (decimalHours === null || decimalHours === undefined) return null;
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}.${minutes.toString().padStart(2, '0')}`;
  }

  private mapSession(session: AttendanceSession | null) {
    if (!session) return null;
    return {
      ...session,
      checkInTime: this.toRiyadhISO(session.checkInTime),
      checkOutTime: this.toRiyadhISO(session.checkOutTime),
      createdAt: this.toRiyadhISO(session.createdAt),
      updatedAt: this.toRiyadhISO(session.updatedAt),
      calculatedHours: this.to60Format(session.calculatedHours),
      overtimeHours: this.to60Format(session.overtimeHours),
    };
  }

  private async getQrExpirySeconds(): Promise<number> {
    const setting = await this.systemSettingRepository.findOne({
      where: { settingKey: 'qr_token_expiry_seconds' }
    });
    return setting ? parseInt(setting.settingValue, 10) || 30 : 30;
  }

  private async validateDayOff(employeeId: number, employee: Employee | null, today: string): Promise<string | null> {
    if (!employee) return null;

    if (employee.offDays) {
      const dayName = new Date().toLocaleDateString('en-US', {
        timeZone: 'Asia/Riyadh', weekday: 'long',
      }).toUpperCase();
      const offList = employee.offDays.split(',').map(d => d.trim().toUpperCase());
      if (offList.includes(dayName)) {
        return 'اليوم إجازة أسبوعية، لا يمكن تسجيل الحضور';
      }
    }

    const holiday = await this.holidayRepository.findOne({
      where: { startDate: LessThanOrEqual(today), endDate: MoreThanOrEqual(today) }
    });
    if (holiday) {
      return `اليوم عطلة رسمية (${holiday.name})، لا يمكن تسجيل الحضور`;
    }

    const activeLeave = await this.leaveRequestRepository.findOne({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: LessThanOrEqual(today),
        endDate: MoreThanOrEqual(today),
      }
    });
    if (activeLeave) {
      const typeName = LEAVE_TYPE_NAMES[activeLeave.leaveType] || activeLeave.leaveType;
      return `لديك إجازة ${typeName} معتمدة لهذا اليوم، لا يمكن تسجيل الحضور`;
    }

    return null;
  }

  constructor(
    @InjectRepository(QrDynamicToken)
    private readonly qrTokenRepository: Repository<QrDynamicToken>,
    @InjectRepository(AttendanceSession)
    private readonly attendanceRepository: Repository<AttendanceSession>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(ShiftPolicy)
    private readonly shiftPolicyRepository: Repository<ShiftPolicy>,
    @InjectRepository(SystemSetting)
    private readonly systemSettingRepository: Repository<SystemSetting>,
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
  ) {}

  async generateQr(adminId: number, purpose: 'CHECK_IN' | 'CHECK_OUT') {
    const token = crypto.randomBytes(32).toString('hex');

    console.log('=== QR GENERATED ===');
    console.log('Token:', token);
    console.log('Token length:', token.length);
    console.log('Purpose:', purpose);

    const expirySeconds = await this.getQrExpirySeconds();
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirySeconds);

    const qrToken = this.qrTokenRepository.create({
      employeeId: adminId,
      token,
      purpose,
      expiresAt,
      used: false,
    });
    await this.qrTokenRepository.save(qrToken);

    const saved = await this.qrTokenRepository.findOne({ where: { token } });
    console.log('Token saved in DB:', !!saved);

    await this.auditLogRepository.save({
      employeeId: adminId,
      action: purpose === 'CHECK_IN' ? 'GENERATE_QR_CHECK_IN' : 'GENERATE_QR_CHECK_OUT',
      details: { qrTokenId: qrToken.id, purpose, expirySeconds },
    });

    return {
      id: qrToken.id,
      qrCode: token,
      purpose,
      expiresAt,
      expirySeconds,
    };
  }

  async checkIn(employeeId: number, qrCode: string) {
    console.log('=== CHECK-IN REQUEST ===');
    console.log('Employee ID:', employeeId);

    const trimmed = qrCode.trim();

    const recentTokens = await this.qrTokenRepository.find({ take: 5, order: { createdAt: 'DESC' } });
    console.log('DB tokens:', recentTokens.map(t => t.token));
    console.log('Searching for:', trimmed);

    const qrToken = await this.qrTokenRepository.findOne({ where: { token: trimmed } });
    if (!qrToken) throw new BadRequestException('رمز QR غير صالح');
    if (qrToken.used) throw new BadRequestException('تم استخدام رمز QR من قبل');
    if (qrToken.expiresAt < new Date()) throw new BadRequestException('انتهت صلاحية رمز QR');
    if (qrToken.purpose !== 'CHECK_IN') {
      qrToken.used = true;
      qrToken.scanError = 'هذا الرمز مخصص للانصراف وليس الحضور';
      await this.qrTokenRepository.save(qrToken);
      throw new BadRequestException(qrToken.scanError);
    }

    const today = this.getTodayRiyadh();

    const activeSession = await this.attendanceRepository.findOne({
      where: { employeeId, date: today, checkInTime: Not(IsNull()), checkOutTime: IsNull() },
    });
    if (activeSession) {
      qrToken.used = true;
      qrToken.scanError = 'أنت مسجل حضور حالياً، يرجى تسجيل انصراف أولاً';
      await this.qrTokenRepository.save(qrToken);
      throw new BadRequestException(qrToken.scanError);
    }

    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });

    const dayOffError = await this.validateDayOff(employeeId, employee, today);
    if (dayOffError) {
      qrToken.used = true;
      qrToken.scanError = dayOffError;
      await this.qrTokenRepository.save(qrToken);
      throw new BadRequestException(qrToken.scanError);
    }

    let status = 'PRESENT';
    if (employee?.shiftPolicyId) {
      const shiftPolicy = await this.shiftPolicyRepository.findOne({ where: { id: employee.shiftPolicyId } });
      if (shiftPolicy) {
        const now = new Date();
        const [startH, startM] = shiftPolicy.startTime.split(':').map(Number);
        const shiftEnd = new Date();
        shiftEnd.setHours(startH, startM + shiftPolicy.graceMinutes, 0, 0);
        if (now > shiftEnd) status = 'LATE';
      }
    }

    qrToken.used = true;
    qrToken.scanError = null;
    await this.qrTokenRepository.save(qrToken);

    const session = this.attendanceRepository.create({
      employeeId,
      date: today,
      checkInTime: new Date(),
      checkInMethod: 'QR_DYNAMIC',
      checkInQrValue: qrCode,
      status,
    });
    await this.attendanceRepository.save(session);

    await this.auditLogRepository.save({
      employeeId,
      action: 'CHECK_IN',
      details: { qrTokenId: qrToken.id, status, date: today },
    });

    return { message: 'تم تسجيل الحضور بنجاح', session: this.mapSession(session) };
  }

  async checkOut(employeeId: number, qrCode: string) {
    const trimmed = qrCode.trim();

    const qrToken = await this.qrTokenRepository.findOne({ where: { token: trimmed } });
    if (!qrToken) throw new BadRequestException('رمز QR غير صالح');
    if (qrToken.used) throw new BadRequestException('تم استخدام رمز QR من قبل');
    if (qrToken.expiresAt < new Date()) throw new BadRequestException('انتهت صلاحية رمز QR');
    if (qrToken.purpose !== 'CHECK_OUT') {
      qrToken.used = true;
      qrToken.scanError = 'هذا الرمز مخصص للحضور وليس الانصراف';
      await this.qrTokenRepository.save(qrToken);
      throw new BadRequestException(qrToken.scanError);
    }

    const today = this.getTodayRiyadh();
    const session = await this.attendanceRepository.findOne({
      where: { employeeId, date: today, checkInTime: Not(IsNull()), checkOutTime: IsNull() },
      order: { checkInTime: 'DESC' },
    });

    if (!session) {
      qrToken.used = true;
      qrToken.scanError = 'يجب تسجيل الحضور أولاً';
      await this.qrTokenRepository.save(qrToken);
      throw new BadRequestException(qrToken.scanError);
    }

    const checkIn = new Date(session.checkInTime!);
    const now = new Date();
    const diffMs = now.getTime() - checkIn.getTime();
    let hoursWorked = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    let breakDuration = 0;
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (employee?.shiftPolicyId) {
      const shiftPolicy = await this.shiftPolicyRepository.findOne({ where: { id: employee.shiftPolicyId } });
      if (shiftPolicy) breakDuration = shiftPolicy.breakDuration / 60;
    }
    hoursWorked = Math.round((hoursWorked - breakDuration) * 100) / 100;
    if (hoursWorked < 0) hoursWorked = 0;

    qrToken.used = true;
    qrToken.scanError = null;
    await this.qrTokenRepository.save(qrToken);

    session.checkOutTime = now;
    session.checkOutMethod = 'QR_DYNAMIC';
    session.checkOutQrValue = qrCode;
    session.calculatedHours = hoursWorked;
    await this.attendanceRepository.save(session);

    await this.auditLogRepository.save({
      employeeId,
      action: 'CHECK_OUT',
      details: { qrTokenId: qrToken.id, calculatedHours: hoursWorked, date: today },
    });

    return { message: 'تم تسجيل الانصراف بنجاح', session: this.mapSession(session) };
  }

  async getTodayStatus(employeeId: number) {
    const today = this.getTodayRiyadh();
    const session = await this.attendanceRepository.findOne({
      where: { employeeId, date: today },
      order: { checkInTime: 'DESC' },
    });
    return { session: this.mapSession(session) };
  }

  async getHistory(employeeId: number, page: number, limit: number) {
    const [data, total] = await this.attendanceRepository.findAndCount({
      where: { employeeId },
      order: { date: 'DESC', checkInTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: data.map(s => this.mapSession(s)), total, page, limit };
  }

  async getQrStatus(tokenId: number) {
    const token = await this.qrTokenRepository.findOne({ where: { id: tokenId } });
    if (!token) throw new BadRequestException('رمز QR غير موجود');
    return { used: token.used, scanError: token.scanError, expiresAt: token.expiresAt, purpose: token.purpose };
  }

  async getReport(dto: AttendanceReportDto) {
    const { employeeName, employeeId, startDate, endDate, page = 1, limit = 20 } = dto;

    const todayRiyadh = this.getTodayRiyadh();
    const [year, month] = todayRiyadh.split('-');
    const defaultStart = `${year}-${month}-01`;
    const defaultEnd = todayRiyadh;
    const sDate = startDate || defaultStart;
    const eDate = endDate || defaultEnd;

    const whereClause: any = { role: Not(Role.ADMIN) };
    if (employeeId) whereClause.id = employeeId;
    else if (employeeName) whereClause.fullName = Like(`%${employeeName}%`);

    const [employees, totalEmployees] = await this.employeeRepository.findAndCount({
      where: whereClause,
      order: { fullName: 'ASC' },
    });

    const allDays: any[] = [];
    const summary: Record<number, { present: number; late: number; absent: number; weeklyOff: number; publicHoliday: number; onLeave: number; totalHours: number }> = {};

    const holidays = await this.holidayRepository.find({
      where: { startDate: LessThanOrEqual(eDate), endDate: MoreThanOrEqual(sDate) }
    });

    const startDt = new Date(sDate);
    const endDt = new Date(eDate);
    const dayCount = Math.floor((endDt.getTime() - startDt.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (const emp of employees) {
      if (!summary[emp.id]) {
        summary[emp.id] = { present: 0, late: 0, absent: 0, weeklyOff: 0, publicHoliday: 0, onLeave: 0, totalHours: 0 };
      }

      const sessions = await this.attendanceRepository.find({
        where: { employeeId: emp.id, date: Between(sDate, eDate) },
        order: { date: 'ASC', checkInTime: 'ASC' },
      });
      const sessionMap = new Map<string, AttendanceSession[]>();
      for (const s of sessions) {
        const arr = sessionMap.get(s.date) || [];
        arr.push(s);
        sessionMap.set(s.date, arr);
      }

      const offDaysList = emp.offDays ? emp.offDays.split(',').map(d => d.trim().toUpperCase()) : [];

      const approvedLeaves = await this.leaveRequestRepository.find({
        where: { employeeId: emp.id, status: 'APPROVED', startDate: LessThanOrEqual(eDate), endDate: MoreThanOrEqual(sDate) }
      });

      for (let i = 0; i < dayCount; i++) {
        const d = new Date(startDt);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        const dayNameEn = d.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
        const dayNameAr = DAY_NAMES[dayNameEn] || dayNameEn;

        const empSessions = sessionMap.get(dateStr) || [];
        const hasCheckIn = empSessions.some(s => s.checkInTime !== null);
        const latestSession = empSessions.length > 0 ? empSessions[empSessions.length - 1] : null;

        let type: string;
        let display: string;
        let reason: string | null = null;
        let checkInTime: string | null = null;
        let checkOutTime: string | null = null;
        let calculatedHours: number | null = null;

        if (hasCheckIn && latestSession) {
          const isLate = latestSession.status === 'LATE';
          type = isLate ? 'LATE' : 'PRESENT';
          display = isLate ? '⚠️ متأخر' : '✅ حاضر';
          checkInTime = latestSession.checkInTime ? this.toRiyadhISO(latestSession.checkInTime)?.split('T')[1]?.split('+')[0]?.substring(0, 5) || null : null;
          checkOutTime = latestSession.checkOutTime ? this.toRiyadhISO(latestSession.checkOutTime)?.split('T')[1]?.split('+')[0]?.substring(0, 5) || null : null;
          calculatedHours = latestSession.calculatedHours;
          if (isLate) summary[emp.id].late++;
          else summary[emp.id].present++;
          if (calculatedHours) summary[emp.id].totalHours += Number(calculatedHours);
        } else if (offDaysList.includes(dayNameEn)) {
          type = 'WEEKLY_OFF';
          display = '🟢 إجازة أسبوعية';
          reason = `إجازة أسبوعية (${dayNameAr})`;
          summary[emp.id].weeklyOff++;
        } else {
          const holiday = holidays.find(h => dateStr >= h.startDate && dateStr <= h.endDate);
          if (holiday) {
            type = 'PUBLIC_HOLIDAY';
            display = '🟣 عطلة رسمية';
            reason = holiday.name;
            summary[emp.id].publicHoliday++;
          } else {
            const leave = approvedLeaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
            if (leave) {
              const typeName = LEAVE_TYPE_NAMES[leave.leaveType] || leave.leaveType;
              type = 'ON_LEAVE';
              display = '🔵 إجازة ' + typeName;
              reason = `إجازة ${typeName} (معتمدة)`;
              summary[emp.id].onLeave++;
            } else {
              type = 'ABSENT';
              display = '❌ غياب';
              reason = 'غياب بدون عذر';
              summary[emp.id].absent++;
            }
          }
        }

        allDays.push({
          employeeId: emp.id,
          employeeName: emp.fullName,
          date: dateStr,
          dayName: dayNameAr,
          type,
          display,
          reason,
          checkInTime,
          checkOutTime,
          calculatedHours: this.to60Format(calculatedHours),
        });
      }
    }

    const totalDays = allDays.length;
    const totalPages = Math.ceil(totalDays / limit) || 1;
    const paginatedDays = allDays.slice((page - 1) * limit, page * limit);

    const statsSummary = Object.entries(summary).map(([eid, s]) => ({
      employeeId: +eid,
      employeeName: employees.find(e => e.id === +eid)?.fullName || '',
      ...s,
      totalHours: this.to60Format(s.totalHours),
    }));

    return {
      startDate: sDate,
      endDate: eDate,
      totalDays,
      page,
      limit,
      totalPages,
      data: statsSummary,
      total: totalDays,
      days: paginatedDays,
      summaries: statsSummary,
    };
  }
}
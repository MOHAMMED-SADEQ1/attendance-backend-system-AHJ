import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendanceSession } from './entities/attendance-session.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceSessionsService {
  constructor(
    @InjectRepository(AttendanceSession)
    private readonly repo: Repository<AttendanceSession>,
  ) {}

  private to60Format(decimalHours: number | null): string | null {
    if (decimalHours === null || decimalHours === undefined) return null;
    const totalMinutes = Math.round(decimalHours * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}.${minutes.toString().padStart(2, '0')}`;
  }

  private mapSession(session: AttendanceSession) {
    return {
      ...session,
      calculatedHours: this.to60Format(session.calculatedHours),
      overtimeHours: this.to60Format(session.overtimeHours),
    };
  }

  async findAll(page = 1, limit = 20, filters?: { employeeId?: number; date?: string; status?: string }) {
    const where: any = {};
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.date) where.date = filters.date;
    if (filters?.status) where.status = filters.status;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { date: 'DESC', checkInTime: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: data.map(s => this.mapSession(s)), total, page, limit };
  }

  async findOne(id: number) {
    const session = await this.repo.findOne({ where: { id } });
    if (!session) throw new NotFoundException('جلسة الحضور غير موجودة');
    return this.mapSession(session);
  }

  async update(id: number, dto: UpdateAttendanceDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }
}

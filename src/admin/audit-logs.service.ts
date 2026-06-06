import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async findAll(page = 1, limit = 50, filters?: { employeeId?: number; action?: string }) {
    const where: any = {};
    if (filters?.employeeId) where.employeeId = filters.employeeId;
    if (filters?.action) where.action = filters.action;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit };
  }

  async findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }
}

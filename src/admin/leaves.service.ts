import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveRequest } from './entities/leave-request.entity';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { Employee } from '../employees/employee.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly repo: Repository<LeaveRequest>,
  ) {}

  async findAll(user: Employee) {
    if (user.role === Role.ADMIN) {
      return this.repo.find({ order: { createdAt: 'DESC' } });
    }
    return this.repo.find({
      where: { employeeId: user.id },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllPending(user: Employee) {
    if (user.role === Role.ADMIN) {
      return this.repo.find({ where: { status: 'PENDING' }, order: { createdAt: 'DESC' } });
    }
    return this.repo.find({
      where: { status: 'PENDING' },
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatus(id: number, dto: UpdateLeaveDto, user: Employee) {
    const leave = await this.repo.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('طلب الإجازة غير موجود');

    if (user.role !== Role.ADMIN && leave.employeeId === user.id) {
      throw new ForbiddenException('لا يمكنك الموافقة على طلبك الخاص');
    }

    leave.status = dto.status;
    leave.approvedBy = user.id;
    leave.approvedAt = new Date();
    return this.repo.save(leave);
  }
}

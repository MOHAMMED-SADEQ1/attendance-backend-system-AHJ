import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Employee } from './employee.entity';
import { LeaveRequest } from '../admin/entities/leave-request.entity';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeesRepository: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRepository: Repository<LeaveRequest>,
  ) {}

  async findByEmail(email: string): Promise<Employee | null> {
    return this.employeesRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('الموظف غير موجود');
    return employee;
  }

  async findAll(user?: Employee): Promise<Employee[]> {
    const where = user?.role === Role.MANAGER ? { role: Not(Role.ADMIN) } : {};
    return this.employeesRepository.find({ where, relations: ['manager'] });
  }

  async findByDepartment(departmentId: number): Promise<Employee[]> {
    return this.employeesRepository.find({ where: { departmentId } });
  }

  async createLeaveRequest(employeeId: number, dto: CreateLeaveRequestDto) {
    if (dto.startDate > dto.endDate) {
      throw new BadRequestException('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
    }

    const leave = this.leaveRepository.create({
      employeeId,
      ...dto,
      status: 'PENDING',
    });
    return this.leaveRepository.save(leave);
  }

  async findMyLeaves(employeeId: number) {
    return this.leaveRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async cancelLeave(id: number, employeeId: number) {
    const leave = await this.leaveRepository.findOne({ where: { id } });
    if (!leave) throw new NotFoundException('طلب الإجازة غير موجود');
    if (leave.employeeId !== employeeId) throw new ForbiddenException('لا يمكنك إلغاء طلب موظف آخر');
    if (leave.status !== 'PENDING') throw new BadRequestException('لا يمكن إلغاء طلب تمت الموافقة عليه أو رفضه');

    leave.status = 'CANCELLED';
    return this.leaveRepository.save(leave);
  }
}

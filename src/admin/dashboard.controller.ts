import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Employee } from '../employees/employee.entity';
import { LeaveRequest } from './entities/leave-request.entity';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class DashboardController {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(LeaveRequest)
    private readonly leaveRepo: Repository<LeaveRequest>,
  ) {}

  @Get('stats')
  async getStats() {
    const totalEmployees = await this.employeeRepo.count();
    const activeEmployees = await this.employeeRepo.count({ where: { isActive: true } });
    const pendingLeaves = await this.leaveRepo.count({ where: { status: 'PENDING' } });
    const managers = await this.employeeRepo.count({ where: { role: Role.MANAGER } });

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      managers,
      pendingLeaves,
    };
  }

  @Get('today')
  async getTodaySummary() {
    const today = new Date().toISOString().split('T')[0];
    const totalEmployees = await this.employeeRepo.count({ where: { isActive: true } });
    const pendingLeaves = await this.leaveRepo.count({ where: { status: 'PENDING' } });

    return {
      date: today,
      totalActiveEmployees: totalEmployees,
      pendingLeaves,
    };
  }
}

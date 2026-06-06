import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Employee } from '../employees/employee.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetEmployeePasswordDto } from './dto/reset-employee-password.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class EmployeesAdminService {
  constructor(
    @InjectRepository(Employee)
    private readonly repo: Repository<Employee>,
  ) {}

  async create(dto: CreateEmployeeDto, currentUser: Employee) {
    if (currentUser.role === Role.MANAGER && (dto.role === Role.ADMIN || dto.role === Role.MANAGER)) {
      throw new BadRequestException('لا يمكنك إضافة موظف بصلاحية مدير عام أو مدير');
    }

    const existingEmail = await this.repo.findOne({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');

    const existingCode = await this.repo.findOne({ where: { employeeCode: dto.employeeCode } });
    if (existingCode) throw new ConflictException('كود الموظف مستخدم مسبقاً');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const employee = this.repo.create({
      ...dto,
      passwordHash,
    });
    return this.repo.save(employee);
  }

  async update(id: number, dto: UpdateEmployeeDto, currentUser: Employee) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('الموظف غير موجود');

    if (currentUser.role === Role.MANAGER) {
      if (employee.role === Role.ADMIN || employee.role === Role.MANAGER) {
        throw new ForbiddenException('لا يمكنك تعديل مدير عام أو مدير');
      }
      if (dto.role === Role.ADMIN || dto.role === Role.MANAGER) {
        throw new BadRequestException('لا يمكنك تعيين صلاحية مدير عام أو مدير');
      }
    }

    await this.repo.update(id, dto);
    return this.repo.findOne({ where: { id } });
  }

  async remove(id: number) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('الموظف غير موجود');
    await this.repo.delete(id);
    return { message: 'تم حذف الموظف بنجاح' };
  }

  async toggleActive(id: number) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('الموظف غير موجود');
    employee.isActive = !employee.isActive;
    return this.repo.save(employee);
  }

  async resetPassword(id: number, dto: ResetEmployeePasswordDto, currentUser: Employee) {
    const employee = await this.repo.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('الموظف غير موجود');

    if (currentUser.role === Role.MANAGER && (employee.role === Role.ADMIN || employee.role === Role.MANAGER)) {
      throw new ForbiddenException('لا يمكنك إعادة تعيين كلمة مرور مدير عام أو مدير');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.repo.update(id, { passwordHash });

    return { message: 'تم إعادة تعيين كلمة المرور بنجاح' };
  }
}

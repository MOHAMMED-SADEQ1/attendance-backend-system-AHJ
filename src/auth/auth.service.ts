import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmployeesService } from '../employees/employees.service';
import { UserSession } from '../user-sessions/user-session.entity';
import { Employee } from '../employees/employee.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserSession)
    private readonly sessionsRepository: Repository<UserSession>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async login(dto: LoginDto, ipAddress?: string, deviceId?: string) {
    const employee = await this.employeesService.findByEmail(dto.email);
    if (!employee) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    if (!employee.isActive) {
      throw new UnauthorizedException('الحساب موقوف، تواصل مع المسؤول');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, employee.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const payload = { sub: employee.id, email: employee.email, role: employee.role };

    const expiresIn = employee.role === Role.ADMIN ? 604800 : 315360000;

    const token = this.jwtService.sign(payload, { expiresIn });

    const expiresAt = new Date();
    if (employee.role === Role.ADMIN) {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 10);
    }

    const session = new UserSession();
    session.employeeId = employee.id;
    session.jwtToken = token;
    session.deviceId = deviceId || null;
    session.ipAddress = ipAddress || null;
    session.expiresAt = expiresAt;
    await this.sessionsRepository.save(session);

    return {
      access_token: token,
      employee: {
        id: employee.id,
        employeeCode: employee.employeeCode,
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        departmentId: employee.departmentId,
      },
    };
  }

  async logout(token: string) {
    const session = await this.sessionsRepository.findOne({
      where: { jwtToken: token },
    });
    if (session) {
      await this.sessionsRepository.delete(session.id);
    }
    return { message: 'تم تسجيل الخروج بنجاح' };
  }

  async getProfile(employeeId: number) {
    const employee = await this.employeesService.findById(employeeId);
    const { passwordHash, ...rest } = employee;
    return rest;
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const employee = await this.employeesService.findById(userId);

    const isPasswordValid = await bcrypt.compare(dto.currentPassword, employee.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.employeeRepository.update(userId, { passwordHash });

    return { message: 'تم تغيير كلمة المرور بنجاح' };
  }

  async updateProfile(userId: number, dto: UpdateEmailDto) {
    const existing = await this.employeesService.findByEmail(dto.email);
    if (existing && existing.id !== userId) {
      throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');
    }

    await this.employeeRepository.update(userId, { email: dto.email });
    return { message: 'تم تحديث البريد الإلكتروني بنجاح' };
  }
}

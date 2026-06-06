import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../user-sessions/user-session.entity';
import { EmployeesService } from '../../employees/employees.service';
import type { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionsRepository: Repository<UserSession>,
    private readonly employeesService: EmployeesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'attendance-jwt-secret-key',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: { sub: number; email: string }) {
    const rawToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    const session = await this.sessionsRepository.findOne({
      where: { jwtToken: rawToken },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('الجلسة منتهية أو غير صالحة');
    }

    const employee = await this.employeesService.findById(payload.sub);
    if (!employee.isActive) {
      throw new UnauthorizedException('الحساب موقوف');
    }

    return employee;
  }
}

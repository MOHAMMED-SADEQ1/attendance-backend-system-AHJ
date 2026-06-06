import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmployeesModule } from '../employees/employees.module';
import { UserSession } from '../user-sessions/user-session.entity';
import { Employee } from '../employees/employee.entity';

@Module({
  imports: [
    EmployeesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'attendance-jwt-secret-key',
      signOptions: { expiresIn: 28800 },
    }),
    TypeOrmModule.forFeature([UserSession, Employee]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

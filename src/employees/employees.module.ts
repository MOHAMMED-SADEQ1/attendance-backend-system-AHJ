import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './employee.entity';
import { LeaveRequest } from '../admin/entities/leave-request.entity';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { EmployeeLeavesController } from './employee-leaves.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, LeaveRequest])],
  providers: [EmployeesService],
  controllers: [EmployeeLeavesController, EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}

import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from './employee.entity';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  async findAll(@CurrentUser() user: Employee) {
    return this.employeesService.findAll(user);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Employee,
  ) {
    if (user.role !== Role.ADMIN && user.role !== Role.MANAGER && user.id !== id) {
      return { message: 'لا يمكنك عرض بيانات موظف آخر' };
    }
    return this.employeesService.findById(id);
  }
}

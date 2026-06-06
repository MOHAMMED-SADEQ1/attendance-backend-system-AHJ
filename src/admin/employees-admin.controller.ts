import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { EmployeesAdminService } from './employees-admin.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ResetEmployeePasswordDto } from './dto/reset-employee-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/employee.entity';

@Controller('admin/employees')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployeesAdminController {
  constructor(private readonly service: EmployeesAdminService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: Employee) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployeeDto, @CurrentUser() user: Employee) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles(Role.ADMIN)
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.service.toggleActive(id);
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN, Role.MANAGER)
  resetPassword(@Param('id', ParseIntPipe) id: number, @Body() dto: ResetEmployeePasswordDto, @CurrentUser() user: Employee) {
    return this.service.resetPassword(id, dto, user);
  }
}

import { Controller, Post, Get, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from './employee.entity';

@Controller('employees/leaves')
@UseGuards(JwtAuthGuard)
export class EmployeeLeavesController {
  constructor(private readonly service: EmployeesService) {}

  @Post()
  createLeave(@CurrentUser() user: Employee, @Body() dto: CreateLeaveRequestDto) {
    return this.service.createLeaveRequest(user.id, dto);
  }

  @Get()
  findMyLeaves(@CurrentUser() user: Employee) {
    return this.service.findMyLeaves(user.id);
  }

  @Patch(':id/cancel')
  cancelLeave(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Employee) {
    return this.service.cancelLeave(id, user.id);
  }
}

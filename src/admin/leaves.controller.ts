import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee } from '../employees/employee.entity';

@Controller('admin/leaves')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeavesController {
  constructor(private readonly service: LeavesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll(@CurrentUser() user: Employee) {
    return this.service.findAll(user);
  }

  @Get('pending')
  @Roles(Role.ADMIN, Role.MANAGER)
  findAllPending(@CurrentUser() user: Employee) {
    return this.service.findAllPending(user);
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN, Role.MANAGER)
  approve(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Employee,
  ) {
    return this.service.updateStatus(id, { status: 'APPROVED' }, user);
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN, Role.MANAGER)
  reject(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: Employee,
  ) {
    return this.service.updateStatus(id, { status: 'REJECTED' }, user);
  }
}

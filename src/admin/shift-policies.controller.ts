import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ShiftPoliciesService } from './shift-policies.service';
import { CreateShiftPolicyDto } from './dto/create-shift-policy.dto';
import { UpdateShiftPolicyDto } from './dto/update-shift-policy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/shift-policies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftPoliciesController {
  constructor(private readonly service: ShiftPoliciesService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateShiftPolicyDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateShiftPolicyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

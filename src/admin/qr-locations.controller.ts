import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { QrLocationsService } from './qr-locations.service';
import { CreateQrLocationDto } from './dto/create-qr-location.dto';
import { UpdateQrLocationDto } from './dto/update-qr-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/qr-locations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QrLocationsController {
  constructor(private readonly service: QrLocationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateQrLocationDto) {
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
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQrLocationDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}

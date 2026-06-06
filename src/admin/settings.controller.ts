import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { SystemSetting } from './entities/system-setting.entity';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repo: Repository<SystemSetting>,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  findAll() {
    return this.repo.find();
  }

  @Patch(':key')
  @Roles(Role.ADMIN)
  async update(@Param('key') key: string, @Body('value') value: string) {
    const setting = await this.repo.findOne({ where: { settingKey: key } });
    if (!setting) throw new NotFoundException('الإعداد غير موجود');
    setting.settingValue = value;
    return this.repo.save(setting);
  }
}

import {
  Controller, Get, Delete,
  Param, ParseIntPipe, UseGuards, Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UserSession } from '../user-sessions/user-session.entity';

@Controller('admin/sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UserSessionsController {
  constructor(
    @InjectRepository(UserSession)
    private readonly repo: Repository<UserSession>,
  ) {}

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? +page : 1;
    const l = limit ? +limit : 20;
    const [data, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (p - 1) * l,
      take: l,
    });
    return { data, total, page: p, limit: l };
  }

  @Delete(':id')
  async forceLogout(@Param('id', ParseIntPipe) id: number) {
    await this.repo.delete(id);
    return { message: 'تم إنهاء الجلسة بنجاح' };
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Holiday } from './entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly repo: Repository<Holiday>,
  ) {}

  async create(dto: CreateHolidayDto) {
    const holiday = this.repo.create(dto);
    return this.repo.save(holiday);
  }

  async findAll() {
    return this.repo.find({ order: { startDate: 'DESC' } });
  }

  async findOne(id: number) {
    const holiday = await this.repo.findOne({ where: { id } });
    if (!holiday) throw new NotFoundException('العطلة غير موجودة');
    return holiday;
  }

  async update(id: number, dto: UpdateHolidayDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const holiday = await this.findOne(id);
    await this.repo.delete(id);
    return holiday;
  }
}

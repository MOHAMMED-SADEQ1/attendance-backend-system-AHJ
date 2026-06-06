import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrStaticLocation } from './entities/qr-static-location.entity';
import { CreateQrLocationDto } from './dto/create-qr-location.dto';
import { UpdateQrLocationDto } from './dto/update-qr-location.dto';

@Injectable()
export class QrLocationsService {
  constructor(
    @InjectRepository(QrStaticLocation)
    private readonly repo: Repository<QrStaticLocation>,
  ) {}

  async create(dto: CreateQrLocationDto) {
    const existing = await this.repo.findOne({ where: { locationCode: dto.locationCode } });
    if (existing) throw new ConflictException('كود الموقع مستخدم مسبقاً');
    const location = this.repo.create(dto);
    return this.repo.save(location);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const location = await this.repo.findOne({ where: { id } });
    if (!location) throw new NotFoundException('الموقع غير موجود');
    return location;
  }

  async update(id: number, dto: UpdateQrLocationDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const location = await this.findOne(id);
    await this.repo.delete(id);
    return location;
  }
}

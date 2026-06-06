import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShiftPolicy } from './entities/shift-policy.entity';
import { CreateShiftPolicyDto } from './dto/create-shift-policy.dto';
import { UpdateShiftPolicyDto } from './dto/update-shift-policy.dto';

@Injectable()
export class ShiftPoliciesService {
  constructor(
    @InjectRepository(ShiftPolicy)
    private readonly repo: Repository<ShiftPolicy>,
  ) {}

  async create(dto: CreateShiftPolicyDto) {
    const policy = this.repo.create(dto);
    return this.repo.save(policy);
  }

  async findAll() {
    return this.repo.find();
  }

  async findOne(id: number) {
    const policy = await this.repo.findOne({ where: { id } });
    if (!policy) throw new NotFoundException('سياسة الدوام غير موجودة');
    return policy;
  }

  async update(id: number, dto: UpdateShiftPolicyDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const policy = await this.findOne(id);
    await this.repo.delete(id);
    return policy;
  }
}

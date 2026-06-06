import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly repo: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const department = this.repo.create(dto);
    return this.repo.save(department);
  }

  async findAll() {
    return this.repo.find({ relations: ['employees'] });
  }

  async findOne(id: number) {
    const department = await this.repo.findOne({ where: { id }, relations: ['employees'] });
    if (!department) throw new NotFoundException('القسم غير موجود');
    return department;
  }

  async update(id: number, dto: UpdateDepartmentDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const department = await this.findOne(id);
    await this.repo.delete(id);
    return department;
  }
}

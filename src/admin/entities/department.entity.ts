import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from '../../employees/employee.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'manager_id', type: 'int', unsigned: true, nullable: true })
  managerId: number;

  @OneToMany(() => Employee, (employee) => employee.department)
  employees: Employee[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

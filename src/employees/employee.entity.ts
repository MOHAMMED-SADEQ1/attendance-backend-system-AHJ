import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../common/enums/role.enum';
import { Department } from '../admin/entities/department.entity';
import { LeaveRequest } from '../admin/entities/leave-request.entity';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'employee_code', length: 20, unique: true })
  employeeCode: string;

  @Column({ name: 'full_name', length: 100 })
  fullName: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.EMPLOYEE })
  role: Role;

  @Column({ name: 'department_id', type: 'int', unsigned: true, nullable: true })
  departmentId: number;

  @Column({ name: 'shift_policy_id', type: 'int', unsigned: true, nullable: true })
  shiftPolicyId: number;

  @Column({ name: 'manager_id', type: 'int', unsigned: true, nullable: true })
  managerId: number;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: Employee;

  @OneToMany(() => Employee, (employee) => employee.manager)
  subordinates: Employee[];

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => LeaveRequest, (leave) => leave.employeeId)
  leaveRequests: LeaveRequest[];

  @Column({ name: 'hire_date', type: 'date' })
  hireDate: string;

  @Column({ name: 'qr_static_token', length: 255, unique: true, nullable: true })
  qrStaticToken: string;

  @Column({ name: 'off_days', type: 'varchar', length: 100, nullable: true })
  offDays: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

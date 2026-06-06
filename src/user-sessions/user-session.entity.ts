import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Employee } from '../employees/employee.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'employee_id', type: 'int', unsigned: true })
  employeeId: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ name: 'jwt_token', type: 'varchar', length: 500 })
  jwtToken: string;

  @Column({ name: 'device_id', type: 'varchar', length: 255, nullable: true })
  deviceId: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

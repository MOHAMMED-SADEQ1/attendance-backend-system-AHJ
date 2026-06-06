import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('leave_requests')
export class LeaveRequest {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'employee_id', type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'enum', enum: ['ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID', 'OTHER'], name: 'leave_type' })
  leaveType: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING' })
  status: string;

  @Column({ name: 'approved_by', type: 'int', unsigned: true, nullable: true })
  approvedBy: number;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

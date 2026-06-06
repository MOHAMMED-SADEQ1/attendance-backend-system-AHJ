import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'employee_id', type: 'int', unsigned: true })
  employeeId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'check_in_time', type: 'timestamp', nullable: true })
  checkInTime: Date | null;

  @Column({ name: 'check_in_method', type: 'varchar', enum: ['QR_DYNAMIC', 'QR_STATIC', 'MANUAL', 'GPS'], nullable: true })
  checkInMethod: string | null;

  @Column({ name: 'check_in_location_id', type: 'int', unsigned: true, nullable: true })
  checkInLocationId: number | null;

  @Column({ name: 'check_in_qr_value', type: 'varchar', length: 255, nullable: true })
  checkInQrValue: string | null;

  @Column({ name: 'check_out_time', type: 'timestamp', nullable: true })
  checkOutTime: Date | null;

  @Column({ name: 'check_out_method', type: 'varchar', enum: ['QR_DYNAMIC', 'QR_STATIC', 'MANUAL', 'GPS'], nullable: true })
  checkOutMethod: string | null;

  @Column({ name: 'check_out_location_id', type: 'int', unsigned: true, nullable: true })
  checkOutLocationId: number | null;

  @Column({ name: 'check_out_qr_value', type: 'varchar', length: 255, nullable: true })
  checkOutQrValue: string | null;

  @Column({ type: 'varchar', enum: ['PRESENT', 'ABSENT', 'LATE', 'EARLY_LEAVE', 'VACATION'], default: 'ABSENT' })
  status: string;

  @Column({
    name: 'calculated_hours', type: 'decimal', precision: 5, scale: 2, nullable: true,
    transformer: { to: (v: number | null) => v, from: (v: string | null) => v ? parseFloat(v) : null },
  })
  calculatedHours: number | null;

  @Column({
    name: 'overtime_hours', type: 'decimal', precision: 5, scale: 2, default: 0,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  overtimeHours: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

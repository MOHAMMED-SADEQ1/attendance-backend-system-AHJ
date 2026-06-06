import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('qr_dynamic_tokens')
export class QrDynamicToken {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'employee_id', type: 'int', unsigned: true })
  employeeId: number;

  @Column({ length: 255 })
  token: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @Column({ type: 'enum', enum: ['CHECK_IN', 'CHECK_OUT'], default: 'CHECK_IN' })
  purpose: string;

  @Column({ name: 'scan_error', type: 'varchar', length: 255, nullable: true })
  scanError: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

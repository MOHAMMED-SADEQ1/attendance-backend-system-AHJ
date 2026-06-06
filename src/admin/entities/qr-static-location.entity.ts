import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('qr_static_locations')
export class QrStaticLocation {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id: number;

  @Column({ name: 'location_name', length: 100 })
  locationName: string;

  @Column({ name: 'location_code', length: 50, unique: true })
  locationCode: string;

  @Column({ name: 'qr_value', length: 255, unique: true })
  qrValue: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ name: 'allowed_network_ssid', length: 100, nullable: true })
  allowedNetworkSsid: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

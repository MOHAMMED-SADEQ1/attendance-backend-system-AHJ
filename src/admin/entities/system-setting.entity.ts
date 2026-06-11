import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn({ type: 'smallint' })
  id: number;

  @Column({ name: 'setting_key', length: 100, unique: true })
  settingKey: string;

  @Column({ name: 'setting_value', type: 'text', nullable: true })
  settingValue: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}



// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   UpdateDateColumn,
// } from 'typeorm';

// @Entity('system_settings')
// export class SystemSetting {
//   @PrimaryGeneratedColumn({ type: 'tinyint', unsigned: true })
//   id: number;

//   @Column({ name: 'setting_key', length: 100, unique: true })
//   settingKey: string;

//   @Column({ name: 'setting_value', type: 'text', nullable: true })
//   settingValue: string;

//   @Column({ type: 'text', nullable: true })
//   description: string;

//   @UpdateDateColumn({ name: 'updated_at' })
//   updatedAt: Date;
// }

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleColumnToEmployees1778817553449 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('employees');
    const hasRoleColumn = table?.columns.find((col) => col.name === 'role');

    if (!hasRoleColumn) {
      await queryRunner.query(`
        ALTER TABLE employees
        ADD COLUMN role ENUM('ADMIN', 'MANAGER', 'EMPLOYEE')
        DEFAULT 'EMPLOYEE' NOT NULL
        COMMENT 'دور المستخدم'
        AFTER password_hash
      `);
      console.log('--- Column "role" added to employees table.');
    } else {
      console.log('--- Column "role" already exists in employees table.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE employees DROP COLUMN role`);
  }
}

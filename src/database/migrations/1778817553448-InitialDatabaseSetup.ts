import { MigrationInterface, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class InitialDatabaseSetup1778817553448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sqlPath = path.resolve(__dirname, '..', 'schema.sql');

    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL file not found at: ${sqlPath}`);
    }

    const rawSql = fs.readFileSync(sqlPath, 'utf8');

    // تقسيم الملف إلى أوامر منفصلة بناءً على الفاصلة المنقوطة
    // مع تنظيف المسافات الفارغة والأسطر الجديدة
    const sqlQueries = rawSql
      .split(';')
      .map((query) => query.trim())
      .filter((query) => query.length > 0);

    console.log(`--- Found ${sqlQueries.length} SQL commands to execute.`);

    for (const query of sqlQueries) {
      try {
        await queryRunner.query(query);
      } catch (error) {
        console.error('--- Error executing command:', query);
        console.error('--- Error details:', error.message);
        throw error; // يوقف الترحيل في حال حدوث خطأ في أي جدول
      }
    }

    console.log('--- All tables created and settings inserted successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // اتركها فارغة للحفاظ على البيانات في نظام الحضور
  }
}

// import { MigrationInterface, QueryRunner } from "typeorm";
// import * as fs from 'fs';
// import * as path from 'path';

// export class InitialDatabaseSetup1778817553448 implements MigrationInterface {
//     public async up(queryRunner: QueryRunner): Promise<void> {
//         // تحديد مسار الملف بدقة
//         const sqlPath = path.resolve(__dirname, '..', 'schema.sql');

//         if (fs.existsSync(sqlPath)) {
//             const sql = fs.readFileSync(sqlPath, 'utf8');
//             // تنفيذ الأوامر
//             await queryRunner.query(sql);
//         } else {
//             console.error(`SQL file not found at: ${sqlPath}`);
//         }
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         // في نظام الحضور، يفضل عدم وضع أوامر حذف هنا إلا إذا كنت متأكداً
//     }
// }

//C:\Users\MOHAMMED\Desktop\attendance-backend-system\src\database\migrations\1778817553448-InitialDatabaseSetup.ts

// import { MigrationInterface, QueryRunner } from "typeorm";

// export class InitialDatabaseSetup1778817553448 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//     }

// }

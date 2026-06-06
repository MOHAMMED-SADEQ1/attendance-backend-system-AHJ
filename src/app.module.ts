import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { AdminModule } from './admin/admin.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({

      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'u450546278_attend',
      password: ':bQqao5u3K',
      database: 'u450546278_attendance_db',


      // type: 'mysql',
      // host: 'localhost',
      // port: 3306,
      // username: 'root',
      // password: '124536',
      // database: 'attendance_db',


      // type: 'postgres',
      // host: 'dpg-d8i1u2lckfvc73bbfcc0-a',
      // port: 5432,
      // username: 'attendance_db_4bpr_user',
      // password: '8b61qhDpm7B0y1l7aNAxZ2BwZFHz68xv',
      // database: 'attendance_db_4bpr',


      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      migrationsRun: false,
      synchronize: false,
      logging: false,
    }),
    AuthModule,
    EmployeesModule,
    AdminModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
  ],
})
export class AppModule {}

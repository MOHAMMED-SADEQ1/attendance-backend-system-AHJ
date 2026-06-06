import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class CreateEmployeeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  employeeCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  shiftPolicyId?: number;

  @IsOptional()
  @IsInt()
  managerId?: number;

  @IsDateString()
  @IsNotEmpty()
  hireDate: string;

  @IsOptional()
  @IsString()
  offDays?: string;
}

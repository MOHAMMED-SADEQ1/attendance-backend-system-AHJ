import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreateDepartmentDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم القسم مطلوب' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsInt()
  managerId?: number;
}

import { IsNotEmpty, IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

export class CreateShiftPolicyDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم السياسة مطلوب' })
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'وقت البداية مطلوب' })
  startTime: string;

  @IsString()
  @IsNotEmpty({ message: 'وقت النهاية مطلوب' })
  endTime: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  graceMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  breakDuration?: number;

  @IsOptional()
  isActive?: boolean;
}

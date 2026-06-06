import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateHolidayDto {
  @IsString()
  @IsNotEmpty({ message: 'اسم العطلة مطلوب' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'تاريخ البداية مطلوب' })
  startDate: string;

  @IsString()
  @IsNotEmpty({ message: 'تاريخ النهاية مطلوب' })
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;
}

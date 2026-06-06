import { IsEnum, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsEnum(['ANNUAL', 'SICK', 'EMERGENCY', 'UNPAID', 'OTHER'])
  @IsNotEmpty()
  leaveType: string;

  @IsString()
  @IsNotEmpty({ message: 'تاريخ البداية مطلوب' })
  startDate: string;

  @IsString()
  @IsNotEmpty({ message: 'تاريخ النهاية مطلوب' })
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

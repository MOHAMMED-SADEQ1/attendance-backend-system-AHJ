import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateLeaveDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';
}

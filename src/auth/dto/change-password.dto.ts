import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'كلمة المرور الحالية مطلوبة' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' })
  @MinLength(6, { message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' })
  newPassword: string;
}

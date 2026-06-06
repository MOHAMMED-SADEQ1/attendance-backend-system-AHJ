import { IsEnum } from 'class-validator';

export enum QrPurpose {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export class GenerateQrDto {
  @IsEnum(QrPurpose)
  purpose: QrPurpose;
}

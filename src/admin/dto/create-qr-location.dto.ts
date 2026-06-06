import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateQrLocationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  locationName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  locationCode: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  qrValue: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  allowedNetworkSsid?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

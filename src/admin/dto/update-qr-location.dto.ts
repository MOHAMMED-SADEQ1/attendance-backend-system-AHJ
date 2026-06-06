import { PartialType } from '@nestjs/mapped-types';
import { CreateQrLocationDto } from './create-qr-location.dto';

export class UpdateQrLocationDto extends PartialType(CreateQrLocationDto) {}

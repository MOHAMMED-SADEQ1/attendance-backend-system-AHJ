import { PartialType } from '@nestjs/mapped-types';
import { CreateShiftPolicyDto } from './create-shift-policy.dto';

export class UpdateShiftPolicyDto extends PartialType(CreateShiftPolicyDto) {}

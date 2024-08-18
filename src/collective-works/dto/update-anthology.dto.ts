import { PartialType } from '@nestjs/mapped-types';
import { CreateAnthologyDto } from './create-anthology.dto';

export class UpdateAnthologyDto extends PartialType(CreateAnthologyDto) {}

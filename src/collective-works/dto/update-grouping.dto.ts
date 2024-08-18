import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupingDto } from './create-grouping.dto';

export class UpdateGroupingDto extends PartialType(CreateGroupingDto) {}

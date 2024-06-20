import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectiveWorkDto } from './create-collective-work.dto';

export class UpdateCollectiveWorkDto extends PartialType(
  CreateCollectiveWorkDto,
) {}

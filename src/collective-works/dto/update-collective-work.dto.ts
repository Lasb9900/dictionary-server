import { PartialType } from '@nestjs/mapped-types';
import { CreateCollectiveWorksDto } from './create-collective-work.dto';

export class UpdateCollectiveWorkDto extends PartialType(
  CreateCollectiveWorksDto,
) {}

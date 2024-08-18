import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsMongoId, IsOptional } from 'class-validator';

// DTO for updating a card, extends CreateCardDto with all fields optional

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  @IsMongoId()
  assignedEditor?: string;

  @IsOptional()
  @IsMongoId()
  assignedReviewer?: string;
}

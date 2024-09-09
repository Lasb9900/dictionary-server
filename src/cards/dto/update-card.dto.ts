import { PartialType } from '@nestjs/mapped-types';
import { CreateCardDto } from './create-card.dto';
import { IsString, IsArray, IsMongoId, IsOptional } from 'class-validator';

export class UpdateCardDto extends PartialType(CreateCardDto) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedEditors?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedReviewers?: string[];
}

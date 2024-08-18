import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAuthorDto } from './create-author.dto';
import { CreateWorkDto } from './create-work.dto';
import { CreateCriticismDto } from './create-criticism.dto';

// DTO for creating a card, with validation rules

export class CreateCardDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAuthorDto)
  author: CreateAuthorDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkDto)
  works: CreateWorkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCriticismDto)
  criticisms: CreateCriticismDto[];

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  assignedEditor: string;

  @IsMongoId()
  assignedReviewer: string;
}

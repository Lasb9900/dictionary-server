import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { CreateReferenceDto } from './create-reference.dto';

// DTO for creating a criticism, with validation rules

export class CreateCriticismDto {
  @IsString()
  type: string;

  @IsString()
  author: string;

  @IsString()
  title: string;

  @IsString()
  publicationDate: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateReferenceDto)
  bibliographicReference: CreateReferenceDto;

  @IsString()
  description: string;
}

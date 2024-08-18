import { Type } from 'class-transformer';
import { IsArray, IsObject, IsString, ValidateNested } from 'class-validator';
import { CreateMultimediaDto } from './create-multimedia.dto';
import { CreateLocationDto } from './create-location.dto';

// DTO for creating an author, with validation rules

export class CreateAuthorDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  dateOfBirth?: string;

  @IsString()
  dateOfDeath: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  placeOfBirth: CreateLocationDto;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  placeOfDeath: CreateLocationDto;

  @IsString()
  gender: string;

  @IsString()
  pseudonym: string;

  @IsString()
  relevantActivities: string;

  @IsArray()
  parents: string[];

  @IsArray()
  siblings: string[];

  @IsArray()
  children: string[];

  @IsString()
  mainTheme: string;

  @IsString()
  mainGenre: string;

  @IsString()
  context: string;

  @IsString()
  image: string;

  @ValidateNested()
  @Type(() => CreateMultimediaDto)
  multimedia: CreateMultimediaDto;

  @IsString()
  audio: string;
}

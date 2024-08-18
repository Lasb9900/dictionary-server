import { Type } from 'class-transformer';
import { IsObject, IsString, ValidateNested } from 'class-validator';
import { CreatePublicationDto } from 'src/common/dto/create-publication.dto';
import { CreateMultimediaDto } from './create-multimedia.dto';

// DTO for creating a work, with validation rules

export class CreateWorkDto {
  @IsString()
  title: string;

  @IsString()
  genre: string;

  @IsString()
  publicationDate: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreatePublicationDto)
  publicationPlace: CreatePublicationDto;

  @IsString()
  description: string;

  @IsString()
  originalLanguage: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateMultimediaDto)
  multimedia: CreateMultimediaDto;

  @IsString()
  workFile: string;

  @IsString()
  coverImage: string;

  @IsString()
  workAudio: string;
}

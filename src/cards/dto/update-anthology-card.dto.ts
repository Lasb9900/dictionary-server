import { IsString, IsArray, IsOptional } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Publication } from '../interfaces/publication-place.interface';
import { Criticism } from '../interfaces/criticism.interface';

export class UpdateAnthologyCardDto {
  @IsOptional()
  @IsString()
  anthologyTitle?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  publicationDate?: string;

  @IsOptional()
  publicationPlace?: Publication;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  multimedia?: Multimedia[];

  @IsOptional()
  @IsArray()
  criticism: Criticism[];

  @IsOptional()
  @IsString()
  text: string;
}

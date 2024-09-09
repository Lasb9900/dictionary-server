import { IsString, IsArray, IsOptional, IsNumber } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Publication } from '../interfaces/publication-place.interface';
import { MagazineCreator } from '../interfaces/magazine-creator.interface';
import { Criticism } from '../interfaces/criticism.interface';

export class UpdateMagazineCardDto {
  @IsOptional()
  @IsString()
  magazineTitle?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  firstIssueDate?: string;

  @IsOptional()
  @IsString()
  lastIssueDate?: string;

  @IsOptional()
  @IsNumber()
  issuesPublished?: number;

  @IsOptional()
  publicationPlace?: Publication;

  @IsOptional()
  @IsArray()
  creators?: MagazineCreator[];

  @IsOptional()
  @IsString()
  sections?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  multimedia?: Multimedia[];

  @IsOptional()
  @IsArray()
  criticism: Criticism[];
}

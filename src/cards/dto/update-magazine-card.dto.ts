import { IsString, IsArray, IsOptional } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
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
  @IsString()
  issuesPublished?: string;

  @IsOptional()
  @IsArray()
  creators?: MagazineCreator[];

  @IsOptional()
  @IsString()
  bibliographicReference: string;

  @IsOptional()
  @IsString()
  link: string;

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

  @IsOptional()
  @IsString()
  text: string;
}

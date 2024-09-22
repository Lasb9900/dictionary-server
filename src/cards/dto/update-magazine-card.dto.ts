import { IsString, IsArray, IsOptional } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { MagazineCreator } from '../interfaces/magazine-creator.interface';
import { Criticism } from '../interfaces/criticism.interface';
import { MagazineIssue } from '../interfaces/number.interface';

export class UpdateMagazineCardDto {
  @IsOptional()
  @IsString()
  magazineTitle?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsArray()
  numbers?: MagazineIssue[];

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

  @IsOptional()
  @IsString()
  text: string;
}

import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Work } from '../interfaces/work.interface';
import { Criticism } from '../interfaces/criticism.interface';
import { Gender } from '../interfaces/gender.interface';
import { Relative } from '../interfaces/relative.interface';

export class UpdateAuthorCardDto {
  @IsOptional()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  pseudonym?: string;

  @IsOptional()
  @IsString()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  dateOfDeath?: string;

  @IsOptional()
  @IsString()
  placeOfBirth: string;

  @IsOptional()
  @IsString()
  placeOfDeath?: string;

  @IsOptional()
  @IsArray()
  relatives?: Relative[];

  @IsOptional()
  @IsString()
  relevantActivities?: string;

  @IsOptional()
  @IsString()
  mainTheme?: string;

  @IsOptional()
  @IsString()
  mainGenre?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsArray()
  multimedia?: Multimedia[];

  @IsOptional()
  @IsArray()
  works: Work[];

  @IsOptional()
  @IsArray()
  criticism: Criticism[];
}

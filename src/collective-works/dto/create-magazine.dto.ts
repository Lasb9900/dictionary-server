import {
  IsString,
  IsDate,
  IsOptional,
  ValidateNested,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Multimedia } from 'src/cards/entities/multimedia.entity';

export class CreateMagazineDto {
  @IsString()
  title: string;

  @IsDate()
  @Type(() => Date)
  firstIssueDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastIssueDate: Date;

  @IsNumber()
  issuesPublished: number;

  @IsString()
  publicationPlace: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  creators: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sections: string[];

  @IsOptional()
  @IsString()
  description: string;

  @IsString()
  originalLanguage: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Multimedia)
  multimedia?: Multimedia;

  @IsOptional()
  @IsString()
  workFile: string;

  @IsOptional()
  @IsString()
  coverImage: string;
}

import { IsString, IsDate, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Publication } from '../../common/entities/publication.entity';
import { Multimedia } from 'src/cards/entities/multimedia.entity';
import { CreateCollectiveWorksDto } from './create-collective-work.dto';

export class CreateAnthologyDto extends CreateCollectiveWorksDto {
  @IsString()
  author: string;

  @IsString()
  title: string;

  @IsString()
  genre: string;

  @IsDate()
  @Type(() => Date)
  publicationDate: Date;

  @IsOptional()
  @ValidateNested()
  @Type(() => Publication)
  publicationPlace?: Publication;

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

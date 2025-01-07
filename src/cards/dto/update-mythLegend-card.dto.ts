import { IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Criticism } from '../interfaces/criticism.interface';
import { MlType } from '../interfaces/mlType.interface';

export class UpdateMythAndLegendCardDto {
  @IsOptional()
  @IsString()
  mlTitle?: string;

  @IsOptional()
  @IsEnum(MlType)
  mlType: MlType;

  @IsOptional()
  @IsString()
  creatorCommunity?: string;

  @IsOptional()
  @IsString()
  diffusionPlace?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  fullText?: string;

  @IsOptional()
  @IsString()
  mainTheme?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  multimedia?: Multimedia[];

  @IsOptional()
  @IsArray()
  criticism?: Criticism[];

  @IsOptional()
  @IsString()
  text: string;
}

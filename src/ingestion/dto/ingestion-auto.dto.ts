import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { IngestionWorksheetDto } from './ingestion-worksheet.dto';

export class IngestionAutoOptionsDto {
  @IsOptional()
  @IsBoolean()
  autoReview?: boolean;

  @IsOptional()
  @IsBoolean()
  autoUpload?: boolean;
}

export class IngestionAutoDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => IngestionAutoOptionsDto)
  options?: IngestionAutoOptionsDto;

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @IsOptional()
  @ValidateNested()
  @Type(() => IngestionWorksheetDto)
  worksheet?: IngestionWorksheetDto;
}

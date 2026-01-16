import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class IngestionAutoFillDto {
  @IsOptional()
  @IsIn(['es'])
  language?: 'es';

  @IsOptional()
  @IsIn(['academic'])
  style?: 'academic';

  @IsOptional()
  @IsBoolean()
  strictJson?: boolean;
}

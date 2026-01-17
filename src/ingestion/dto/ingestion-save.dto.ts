import { Transform } from 'class-transformer';
import { IsObject } from 'class-validator';

export class IngestionSaveDto {
  @Transform(({ value, obj }) => value ?? obj)
  @IsObject()
  payload: Record<string, any>;
}

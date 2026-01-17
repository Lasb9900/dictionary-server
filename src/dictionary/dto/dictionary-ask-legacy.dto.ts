import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class DictionaryAskLegacyDto {
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  question: string[];
}

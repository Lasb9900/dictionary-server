import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class DictionaryAskDto {
  @IsString()
  question: string;

  @IsOptional()
  @IsMongoId()
  cardId?: string;

  @IsOptional()
  @IsString()
  cardType?: string;
}

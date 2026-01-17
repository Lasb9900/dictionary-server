import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateWorkCardDto {
  @IsString()
  title: string;

  @IsString()
  authorFullName: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  @IsOptional()
  @IsString()
  originalLanguage?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  publicationDate?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

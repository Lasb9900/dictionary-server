import { IsArray, IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';

export enum IngestionCardType {
  AuthorCard = 'AuthorCard',
  AnthologyCard = 'AnthologyCard',
  GroupingCard = 'GroupingCard',
  MagazineCard = 'MagazineCard',
}

export class IngestionWorksheetDto {
  @IsEnum(IngestionCardType)
  type: IngestionCardType;

  @IsString()
  title: string;

  @IsMongoId()
  createdBy: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedEditors?: string[];

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  assignedReviewers?: string[];
}

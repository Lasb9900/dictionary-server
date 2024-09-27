import {
  IsString,
  IsEnum,
  IsArray,
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsEnum(['AuthorCard', 'AnthologyCard', 'GroupingCard', 'MagazineCard'])
  type: string;

  @IsString()
  title: string;

  @IsMongoId()
  createdBy: string;

  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  assignedEditors: string[];

  @IsArray()
  @IsNotEmpty()
  @IsMongoId({ each: true })
  assignedReviewers: string[];
}

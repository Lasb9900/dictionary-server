import { IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Criticism } from 'src/cards/entities/criticism.entity';

export class CreateCollectiveWorksDto {
  @IsEnum(['Grouping', 'Magazine', 'Anthology'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Criticism)
  criticisms: Criticism[];
}

import { IsString, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { GroupPublication } from '../entities/group-publication.entity';
import { Location } from 'src/cards/entities/location.entity';

// DTO for Grouping
export class CreateGroupingDto {
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Location)
  meetingPlace: Location;

  @IsOptional()
  @IsString()
  startDate: string;

  @IsOptional()
  @IsString()
  endDate: string;

  @IsOptional()
  @IsString()
  generalCharacteristics: string;

  @IsArray()
  @IsString({ each: true })
  members: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupPublication)
  groupPublications?: GroupPublication[];

  @IsOptional()
  @IsString()
  groupActivities: string;
}

import { IsString, IsArray, IsOptional } from 'class-validator';
import { Multimedia } from '../interfaces/multimedia.interface';
import { MeetingPlace } from '../interfaces/meeting-place.interface';
import { GroupPublication } from '../interfaces/group-publication.interface';
import { Criticism } from '../interfaces/criticism.interface';

export class UpdateGroupingCardDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  meetingPlace?: MeetingPlace;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  generalCharacteristics?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];

  @IsOptional()
  @IsArray()
  groupPublications?: GroupPublication[];

  @IsOptional()
  @IsString()
  groupActivities?: string;

  @IsOptional()
  @IsArray()
  multimedia?: Multimedia[];

  @IsOptional()
  @IsArray()
  criticism: Criticism[];
}

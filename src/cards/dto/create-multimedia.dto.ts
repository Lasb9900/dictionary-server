import { IsString } from 'class-validator';

// DTO for creating a multimedia, with validation rules

export class CreateMultimediaDto {
  @IsString()
  link: string;

  @IsString()
  type: string;

  @IsString()
  restriction: string;
}

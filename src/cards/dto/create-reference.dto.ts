import { IsString } from 'class-validator';

// DTO for creating a reference, with validation rules

export class CreateReferenceDto {
  @IsString()
  link: string;

  @IsString()
  publication: string;
}

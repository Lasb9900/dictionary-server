import { IsString } from 'class-validator';

// DTO for Location entity with validation rules

export class CreateLocationDto {
  @IsString()
  city: string;

  @IsString()
  municipality: string;

  @IsString()
  state: string;

  @IsString()
  country: string;
}

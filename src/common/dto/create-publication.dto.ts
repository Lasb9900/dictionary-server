import { IsString } from 'class-validator';

// DTO for Publication entity with validation rules

export class CreatePublicationDto {
  @IsString()
  city: string;

  @IsString()
  printingHouse: string;

  @IsString()
  publisher: string;
}

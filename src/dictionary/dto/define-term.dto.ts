import { IsEnum, IsOptional, IsString } from 'class-validator';

export class DefineTermDto {
  @IsString()
  term: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsEnum(['basic', 'academic'])
  level?: 'basic' | 'academic';
}

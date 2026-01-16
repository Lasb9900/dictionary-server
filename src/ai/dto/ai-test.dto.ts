import { IsIn, IsOptional, IsString } from 'class-validator';
import { AiProviderName } from '../interfaces/ai-provider.interface';

export class AiTestDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsIn(['gemini', 'ollama'])
  provider?: AiProviderName;
}

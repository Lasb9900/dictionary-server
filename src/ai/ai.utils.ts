import { BadRequestException } from '@nestjs/common';
import { AiProviderName } from './interfaces/ai-provider.interface';

export const normalizeAiProvider = (
  value?: string,
): AiProviderName | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'gemini' || normalized === 'ollama') {
    return normalized;
  }

  throw new BadRequestException(
    `Unsupported AI provider override: ${value}`,
  );
};

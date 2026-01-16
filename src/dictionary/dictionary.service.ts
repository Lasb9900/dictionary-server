import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AiProviderName } from '../ai/interfaces/ai-provider.interface';

type DictionaryEnvelopeType =
  | 'biography'
  | 'list'
  | 'similarity'
  | 'comparison'
  | 'multimedia'
  | 'model'
  | 'summary';

@Injectable()
export class DictionaryService {
  constructor(private readonly aiService: AiService) {}

  async ask(
    dictionaryId: string,
    questions: string[],
    providerOverride?: AiProviderName,
  ) {
    const query = questions.join('\n');
    const providerUsed = this.aiService.resolveProviderName(providerOverride);

    const type: DictionaryEnvelopeType = this.resolveType(query);

    if (type === 'model') {
      const output = await this.aiService.generateText(
        'Describe el modelo y proveedor en uso para este entorno.',
        { providerOverride },
      );

      return {
        type,
        query,
        result: output,
      };
    }

    const answer = await this.aiService.generateText(
      'Responde en español con un resumen conciso y factual.',
      { providerOverride, input: query },
    );

    const payload = {
      dictionaryId,
      provider: providerUsed,
      answer,
      multimedia: {
        images: [],
        videos: [],
        audios: [],
        documents: [],
      },
    };

    return {
      type,
      query,
      result: `json ${JSON.stringify(payload)}`,
    };
  }

  private resolveType(query: string): DictionaryEnvelopeType {
    const normalized = query.toLowerCase();
    if (normalized.includes('modelo') || normalized.includes('model')) {
      return 'model';
    }
    return 'summary';
  }
}

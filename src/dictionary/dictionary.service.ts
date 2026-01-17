import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AiProviderName } from '../ai/interfaces/ai-provider.interface';
import { CardsService } from '../cards/cards.service';
import { DictionaryAskDto } from './dto/dictionary-ask.dto';

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
  constructor(
    private readonly aiService: AiService,
    private readonly cardsService: CardsService,
  ) {}

  async askIntro(
    dto: DictionaryAskDto,
    providerOverride?: AiProviderName,
  ) {
    const question = dto.question?.trim();
    if (!question) {
      throw new BadRequestException('question is required.');
    }

    let cards: Record<string, any>[] = [];
    if (dto.cardId) {
      const card = await this.cardsService.findByIdRaw(dto.cardId);
      if (!card) {
        throw new NotFoundException('Card not found.');
      }
      if (dto.cardType && card.type !== dto.cardType) {
        throw new BadRequestException('cardType does not match cardId.');
      }
      cards = [card];
    } else {
      cards = await this.cardsService.searchCardsByTitleOrFullName(
        question,
        3,
        dto.cardType,
      );
    }

    const sources = cards.map((card: any) => ({
      type: card.type,
      id: card._id?.toString(),
      title: card.title ?? card.fullName,
    }));

    const context = cards.length ? JSON.stringify(cards) : '[]';
    const prompt = [
      'Eres un asistente del diccionario.',
      'Responde SOLO con datos presentes en el CONTEXTO.',
      'Si el CONTEXTO no contiene la información, responde: "No tengo datos suficientes en el diccionario."',
      '',
      'CONTEXTO:',
      context,
      '',
      'PREGUNTA:',
      question,
    ].join('\n');

    const response = await this.aiService.generateText(prompt, {
      providerOverride,
    });

    return {
      answer: response.output,
      sources,
      provider: response.providerUsed,
    };
  }

  async ask(
    dictionaryId: string,
    questions: string[],
    providerOverride?: AiProviderName,
  ) {
    const query = questions.join('\n');
    const providerUsed = this.aiService.resolveProviderName(providerOverride);
    const type: DictionaryEnvelopeType = this.resolveType(query);

    if (type === 'model') {
      const result = await this.aiService.generateWithFallback(
        'Describe el modelo y proveedor en uso para este entorno.',
        { providerOverride },
      );

      return {
        type,
        query,
        result: result.output,
      };
    }

    // 1) Cargar ficha REAL
    const card = await this.cardsService.findByIdRaw(dictionaryId);
    if (!card) throw new NotFoundException(`Card not found: ${dictionaryId}`);

    // 2) Contexto (puedes reducirlo si luego quieres)
    const context = JSON.stringify(card);

    // 3) Detectar si el usuario pide JSON estricto
    const wantsJson =
      query.toLowerCase().includes('devuelve') &&
      query.toLowerCase().includes('json');

    // 4) Prompt anclado + reglas anti-invención
    const prompt = [
      `Eres un extractor de datos. Tu trabajo es EXTRAER campos SOLO del CONTEXTO.`,
      `REGLAS (estrictas):`,
      `- NO uses conocimiento general. NO completes con suposiciones.`,
      `- Si un dato NO aparece literalmente en el CONTEXTO, usa null.`,
      `- Devuelve SOLO JSON valido (sin markdown, sin texto extra).`,
      `- Respeta este esquema EXACTO:`,
      `  { "nacimiento": string|null, "muerte": string|null, "nacionalidad": string|null, "obras": string[] }`,
      `- "obras" solo puede incluir titulos que esten en el CONTEXTO. Si no hay, devuelve [].`,
      `- "obras" SOLO puede salir de works del CONTEXTO. Si works esta vacio o no existe, devuelve obras: []. NO uses title ni fullName como obras.`,
      ``,
      `CONTEXTO (ficha):`,
      context,
      ``,
      `PREGUNTA:`,
      query,
    ].join('\n');

    const answer = await this.aiService.generateText(prompt, { providerOverride });

    // 5) Si pidió JSON, intentamos parsear para devolver objeto real
    let parsedAnswer: any = null;
    if (wantsJson) {
      try {
        parsedAnswer = JSON.parse(answer.output);
      } catch {
        parsedAnswer = null; // si el modelo no devolvió JSON válido
      }
    }

    function sanitizeAnswer(obj: any) {
      const safe = {
        nacimiento: typeof obj?.nacimiento === 'string' ? obj.nacimiento : null,
        muerte: typeof obj?.muerte === 'string' ? obj.muerte : null,
        nacionalidad:
          typeof obj?.nacionalidad === 'string' ? obj.nacionalidad : null,
        obras: Array.isArray(obj?.obras)
          ? obj.obras.filter((x: any) => typeof x === 'string')
          : [],
      };
      return safe;
    }
    parsedAnswer = sanitizeAnswer(parsedAnswer);

    const worksFromContext: string[] = Array.isArray((card as any).works)
      ? (card as any).works
          .map((w: any) => (typeof w === 'string' ? w : w?.title))
          .filter((t: any) => typeof t === 'string' && t.trim().length > 0)
      : [];

    if (parsedAnswer) {
      parsedAnswer.obras = worksFromContext.length ? parsedAnswer.obras : [];
    }

    return {
      type,
      query,
      result: {
        dictionaryId,
        provider: providerUsed,
        answer: parsedAnswer ?? answer.output,
        multimedia: {
          images: [],
          videos: [],
          audios: [],
          documents: [],
        },
      },
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

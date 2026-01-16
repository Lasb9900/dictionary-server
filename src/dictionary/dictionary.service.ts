import {
  BadRequestException,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiService } from '../ai/ai.service';
import { DictionaryEntry } from './entities/dictionary-entry.entity';
import { DefineTermDto } from './dto/define-term.dto';

@Injectable()
export class DictionaryService {
  private readonly logger = new Logger(DictionaryService.name);

  constructor(
    private readonly aiService: AiService,
    @InjectModel(DictionaryEntry.name)
    private readonly dictionaryModel: Model<DictionaryEntry>,
  ) {}

  async defineTerm(dto: DefineTermDto) {
    if (!dto.term?.trim()) {
      throw new BadRequestException('term is required');
    }

    const term = dto.term.trim();
    const level = dto.level ?? 'academic';
    const context = dto.context?.trim();

    const prompt = [
      'Eres un lexicógrafo académico. Genera una definición precisa y concisa.',
      'Devuelve SOLO JSON válido con las llaves: definition, examples, tags, sources.',
      'examples debe tener exactamente 2 ejemplos y tags exactamente 3 etiquetas.',
      'sources puede ser un arreglo vacío si no hay fuentes específicas.',
      `Término: "${term}".`,
      `Nivel: "${level}".`,
      context ? `Contexto: "${context}".` : undefined,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await this.aiService.generateText(prompt);
    let parsed: Record<string, any>;
    try {
      parsed = this.parseJsonResponse(response);
    } catch (error) {
      this.logger.warn('Failed to parse AI response for dictionary');
      throw new UnprocessableEntityException('Invalid AI response');
    }

    if (!parsed.definition || !Array.isArray(parsed.examples)) {
      this.logger.warn('AI response missing required fields for dictionary');
      throw new UnprocessableEntityException('Invalid AI response');
    }

    const payload = {
      term,
      definition: String(parsed.definition).trim(),
      examples: parsed.examples.map((example: string) => String(example).trim()),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags.map((tag: string) => String(tag).trim())
        : [],
      sources: Array.isArray(parsed.sources)
        ? parsed.sources.map((source: string) => String(source).trim())
        : [],
    };

    return this.dictionaryModel
      .findOneAndUpdate(
        { term },
        {
          $set: payload,
          $setOnInsert: { createdAt: new Date() },
        },
        { new: true, upsert: true, runValidators: true },
      )
      .exec();
  }

  private parseJsonResponse(text: string) {
    try {
      return JSON.parse(text);
    } catch (error) {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        return JSON.parse(text.slice(start, end + 1));
      }
      throw error;
    }
  }
}

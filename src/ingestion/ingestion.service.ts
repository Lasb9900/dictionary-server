import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/entities/card.entity';
import { AuthorCard } from '../cards/entities/author.entity';
import { UpdateAnthologyCardDto } from '../cards/dto/update-anthology-card.dto';
import { UpdateAuthorCardDto } from '../cards/dto/update-author-card.dto';
import { UpdateGroupingCardDto } from '../cards/dto/update-grouping-card.dto';
import { UpdateMagazineCardDto } from '../cards/dto/update-magazine-card.dto';
import {
  IngestionCardType,
  IngestionWorksheetDto,
} from './dto/ingestion-worksheet.dto';
import { CardReadinessService } from './services/card-readiness.service';
import {
  normalizeAnthologyPayload,
  normalizeAuthorPayload,
  normalizeGroupingPayload,
  normalizeMagazinePayload,
} from './utils/normalization';
import { AiService } from '../ai/ai.service';
import { CardStatus } from '../cards/interfaces/card-status.interface';
import { IngestionAutoFillDto } from './dto/ingestion-auto-fill.dto';

@Injectable()
export class IngestionService {
  constructor(
    private readonly cardsService: CardsService,
    private readonly readinessService: CardReadinessService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService,
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
    @InjectModel(AuthorCard.name)
    private readonly authorCardModel: Model<AuthorCard>,
  ) {}

  async createWorksheet(dto: IngestionWorksheetDto) {
    const payload = {
      ...dto,
      assignedEditors: dto.assignedEditors ?? [],
      assignedReviewers: dto.assignedReviewers ?? [],
    };

    return this.cardsService.createCard(payload);
  }

  async saveByType(type: IngestionCardType, id: string, payload: any) {
    const normalizedPayload = this.normalizePayload(type, payload);

    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.cardsService.saveAuthorCardContent(
          id,
          normalizedPayload as UpdateAuthorCardDto,
        );
      case IngestionCardType.AnthologyCard:
        return this.cardsService.saveAnthologyCardContent(
          id,
          normalizedPayload as UpdateAnthologyCardDto,
        );
      case IngestionCardType.MagazineCard:
        return this.cardsService.saveMagazineCardContent(
          id,
          normalizedPayload as UpdateMagazineCardDto,
        );
      case IngestionCardType.GroupingCard:
        return this.cardsService.saveGroupingCardContent(
          id,
          normalizedPayload as UpdateGroupingCardDto,
        );
      default:
        throw new BadRequestException('Unsupported card type');
    }
  }

  async autoReview(type: IngestionCardType, id: string) {
    const card = await this.findCardById(id, type);
    const missingFields = this.readinessService.getMissingFieldsForReview(
      type,
      card,
    );

    if (missingFields.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Card is not ready for auto-review',
        missingFields,
      });
    }

    if (type === IngestionCardType.AuthorCard) {
      return this.autoReviewAuthorCard(id, card as AuthorCard);
    }

    const updatePayload = this.buildUpdatePayloadForReview(type, card);

    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.cardsService.updateAuthorCardAndSetPendingReview(
          id,
          updatePayload as UpdateAuthorCardDto,
        );
      case IngestionCardType.AnthologyCard:
        return this.cardsService.updateAnthologyCardAndSetPendingReview(
          id,
          updatePayload as UpdateAnthologyCardDto,
        );
      case IngestionCardType.MagazineCard:
        return this.cardsService.updateMagazineCardAndSetPendingReview(
          id,
          updatePayload as UpdateMagazineCardDto,
        );
      case IngestionCardType.GroupingCard:
        return this.cardsService.updateGroupingCardAndSetPendingReview(
          id,
          updatePayload as UpdateGroupingCardDto,
        );
      default:
        throw new BadRequestException('Unsupported card type');
    }
  }

  async autoFill(
    type: IngestionCardType,
    id: string,
    options: IngestionAutoFillDto,
  ) {
    if (type !== IngestionCardType.AuthorCard) {
      throw new BadRequestException('Unsupported card type for auto-fill');
    }

    const card = (await this.findCardById(id, type)) as AuthorCard;
    const language = options.language ?? 'es';
    const style = options.style ?? 'academic';
    const strictJson = options.strictJson ?? true;

    const prompt = [
      'Eres un editor académico especializado en fichas de autor.',
      'Debes completar SOLO los campos vacíos del autor.',
      'Genera información plausible pero no inventes datos verificables (fechas exactas, lugares específicos) si no están en el input.',
      'Devuelve JSON con las llaves: fullName, shortBio, works, criticism, relatives, multimedia.',
      'works debe ser un arreglo; para cada obra incluye title, originalLanguage, genre, publicationDate, publicationPlace (city, printingHouse, publisher), description, editions.',
      'criticism debe ser un arreglo con title, author, publicationDate, description (resumen académico).',
      'relatives y multimedia pueden ser arreglos vacíos.',
      strictJson ? 'RESPONDE SOLO JSON válido.' : 'Responde en JSON.',
      `Idioma: ${language}.`,
      `Estilo: ${style}.`,
      `Ficha actual: ${JSON.stringify(card)}.`,
    ].join('\n');

    const response = await this.aiService.generateText(prompt);
    let generated: Record<string, any>;
    try {
      generated = this.parseJsonResponse(response);
    } catch (error) {
      throw new UnprocessableEntityException('Invalid AI response');
    }

    const updates: Partial<AuthorCard> = {};

    if (!card.fullName && generated.fullName) {
      updates.fullName = String(generated.fullName).trim();
    }

    if (!card.shortBio && generated.shortBio) {
      updates.shortBio = String(generated.shortBio).trim();
    }

    if ((!card.relatives || card.relatives.length === 0) && generated.relatives) {
      updates.relatives = Array.isArray(generated.relatives)
        ? generated.relatives
        : [];
    }

    if (
      (!card.multimedia || card.multimedia.length === 0) &&
      generated.multimedia
    ) {
      updates.multimedia = Array.isArray(generated.multimedia)
        ? generated.multimedia
        : [];
    }

    if (Array.isArray(card.works) && card.works.length > 0) {
      const generatedWorks = Array.isArray(generated.works)
        ? generated.works
        : [];
      updates.works = card.works.map((work) => {
        if (!work?.title) {
          return work;
        }
        const match = generatedWorks.find(
          (generatedWork) =>
            String(generatedWork?.title || '').toLowerCase() ===
            String(work.title).toLowerCase(),
        );
        if (!match) {
          return work;
        }
        return {
          ...work,
          originalLanguage: work.originalLanguage || match.originalLanguage,
          genre: work.genre || match.genre,
          publicationDate: work.publicationDate || match.publicationDate,
          publicationPlace:
            work.publicationPlace || match.publicationPlace,
          description: work.description || match.description,
          editions:
            work.editions && work.editions.length > 0
              ? work.editions
              : match.editions || [],
        };
      });
    }

    const generatedCriticism = Array.isArray(generated.criticism)
      ? generated.criticism
      : [];
    if (Array.isArray(card.criticism) && card.criticism.length > 0) {
      updates.criticism = card.criticism.map((item) => {
        const titleKey = item?.title ?? '';
        const match = generatedCriticism.find(
          (generatedItem) =>
            String(generatedItem?.title || '').toLowerCase() ===
            String(titleKey).toLowerCase(),
        );
        if (!match) {
          return item;
        }
        return {
          ...item,
          description: item.description || match.description,
          author: item.author || match.author,
          publicationDate: item.publicationDate || match.publicationDate,
        };
      });
    } else if (generatedCriticism.length > 0) {
      updates.criticism = generatedCriticism;
    }

    const updated = await this.authorCardModel
      .findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updated) {
      throw new NotFoundException('Card not found');
    }

    return updated;
  }

  async autoUpload(type: IngestionCardType, id: string) {
    const card = await this.findCardById(id, type);
    const missingFields = this.readinessService.getMissingFieldsForUpload(
      type,
      card,
    );

    if (missingFields.length > 0) {
      throw new UnprocessableEntityException({
        message: 'Card is not ready for auto-upload',
        missingFields,
      });
    }

    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.cardsService.uploadAuthorCard(id);
      case IngestionCardType.AnthologyCard:
        return this.cardsService.uploadAnthologyCard(id);
      case IngestionCardType.MagazineCard:
        return this.cardsService.uploadMagazineCard(id);
      case IngestionCardType.GroupingCard:
        return this.cardsService.uploadGroupingCard(id);
      default:
        throw new BadRequestException('Unsupported card type');
    }
  }

  async autoOrchestrate(
    type: IngestionCardType,
    cardId: string | undefined,
    payload: Record<string, any>,
    options: { autoReview?: boolean; autoUpload?: boolean } = {},
    worksheet?: IngestionWorksheetDto,
  ) {
    let targetId = cardId;

    if (!targetId) {
      if (!worksheet) {
        throw new BadRequestException(
          'cardId query param or worksheet payload is required',
        );
      }

      const duplicates = await this.findPossibleDuplicates(type, payload);
      if (duplicates.length > 0) {
        throw new ConflictException({
          possibleDuplicate: true,
          existingIds: duplicates,
        });
      }

      const created = await this.createWorksheet({
        ...worksheet,
        type,
      });
      targetId = created._id.toString();
    }

    await this.saveByType(type, targetId, payload);

    if (options.autoReview) {
      await this.autoReview(type, targetId);
    }

    if (options.autoUpload) {
      await this.autoUpload(type, targetId);
    }

    return { id: targetId };
  }

  private normalizePayload(type: IngestionCardType, payload: Record<string, any>) {
    switch (type) {
      case IngestionCardType.AuthorCard:
        return normalizeAuthorPayload(payload);
      case IngestionCardType.AnthologyCard:
        return normalizeAnthologyPayload(payload);
      case IngestionCardType.MagazineCard:
        return normalizeMagazinePayload(payload);
      case IngestionCardType.GroupingCard:
        return normalizeGroupingPayload(payload);
      default:
        return payload;
    }
  }

  private async findCardById(id: string, type: IngestionCardType) {
    const card = await this.cardModel.findById(id).lean().exec();
    if (!card) {
      throw new NotFoundException('Card not found');
    }

    if (card.type !== type) {
      throw new BadRequestException('Card type mismatch');
    }

    return card;
  }

  private async autoReviewAuthorCard(id: string, card: AuthorCard) {
    const prompt = [
      'Eres un revisor editorial académico especializado en literatura.',
      'Analiza la ficha del autor y redacta una revisión con tono profesional.',
      'Incluye observaciones sobre coherencia, precisión, claridad, sesgos y vacíos de información.',
      'Sugiere mejoras concretas y preguntas pendientes.',
      'Devuelve un texto continuo, sin viñetas.',
      `Ficha: ${JSON.stringify({
        fullName: card.fullName,
        shortBio: card.shortBio,
        gender: card.gender,
        pseudonym: card.pseudonym,
        dateOfBirth: card.dateOfBirth,
        dateOfDeath: card.dateOfDeath,
        placeOfBirth: card.placeOfBirth,
        placeOfDeath: card.placeOfDeath,
        relatives: card.relatives,
        relevantActivities: card.relevantActivities,
        mainTheme: card.mainTheme,
        mainGenre: card.mainGenre,
        context: card.context,
        works: card.works,
        criticism: card.criticism,
      })}`,
    ].join('\n');

    const reviewText = await this.aiService.generateText(prompt);
    const provider =
      this.configService.get<string>('AI_PROVIDER') ||
      process.env.AI_PROVIDER ||
      'ollama';

    const updated = await this.authorCardModel
      .findByIdAndUpdate(
        id,
        {
          status: CardStatus.PENDING_REVIEW,
          autoReview: {
            provider,
            text: reviewText,
            createdAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Card not found');
    }

    return {
      ok: true,
      status: CardStatus.PENDING_REVIEW,
      autoReview: updated.autoReview,
    };
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

  private buildUpdatePayloadForReview(
    type: IngestionCardType,
    card: Record<string, any>,
  ) {
    switch (type) {
      case IngestionCardType.AuthorCard:
        return {
          ...card,
          works: card.works ?? [],
          criticism: card.criticism ?? [],
        };
      case IngestionCardType.AnthologyCard:
        return {
          ...card,
          criticism: card.criticism ?? [],
        };
      case IngestionCardType.MagazineCard:
        return {
          ...card,
          creators: card.creators ?? [],
          criticism: card.criticism ?? [],
        };
      case IngestionCardType.GroupingCard:
        return {
          ...card,
          groupPublications: card.groupPublications ?? [],
          criticism: card.criticism ?? [],
        };
      default:
        return card;
    }
  }

  private async findPossibleDuplicates(
    type: IngestionCardType,
    payload: Record<string, any>,
  ) {
    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const buildRegex = (value?: string) => {
      if (value === undefined || value === null) {
        return undefined;
      }
      const normalized = String(value).trim();
      if (!normalized) {
        return undefined;
      }
      return new RegExp(`^${escapeRegExp(normalized)}$`, 'i');
    };

    let query: Record<string, any> | null = null;

    switch (type) {
      case IngestionCardType.AuthorCard: {
        const fullName = buildRegex(payload.fullName);
        if (!fullName) {
          return [];
        }
        query = {
          type,
          fullName,
        };
        const dateOfBirth = buildRegex(payload.dateOfBirth);
        if (dateOfBirth) {
          query.dateOfBirth = dateOfBirth;
        }
        break;
      }
      case IngestionCardType.AnthologyCard: {
        const anthologyTitle = buildRegex(payload.anthologyTitle);
        if (!anthologyTitle) {
          return [];
        }
        query = {
          type,
          anthologyTitle,
        };
        const publicationDate = buildRegex(payload.publicationDate);
        if (publicationDate) {
          query.publicationDate = publicationDate;
        }
        break;
      }
      case IngestionCardType.MagazineCard: {
        const magazineTitle = buildRegex(payload.magazineTitle);
        if (!magazineTitle) {
          return [];
        }
        query = {
          type,
          magazineTitle,
        };
        const firstIssueDate = buildRegex(payload.firstIssueDate);
        if (firstIssueDate) {
          query.firstIssueDate = firstIssueDate;
        }
        break;
      }
      case IngestionCardType.GroupingCard: {
        const name = buildRegex(payload.name);
        if (!name) {
          return [];
        }
        query = {
          type,
          name,
        };
        const startDate = buildRegex(payload.startDate);
        if (startDate) {
          query.startDate = startDate;
        }
        break;
      }
      default:
        return [];
    }

    if (!query) {
      return [];
    }

    const results = await this.cardModel
      .find(query)
      .select('_id')
      .limit(5)
      .lean()
      .exec();

    return results.map((result) => result._id.toString());
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CardsService } from '../cards/cards.service';
import { Card } from '../cards/entities/card.entity';
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
import { AiProviderName } from '../ai/interfaces/ai-provider.interface';
import { UpdateAuthorCardDto } from '../cards/dto/update-author-card.dto';
import { UpdateAnthologyCardDto } from '../cards/dto/update-anthology-card.dto';
import { UpdateMagazineCardDto } from '../cards/dto/update-magazine-card.dto';
import { UpdateGroupingCardDto } from '../cards/dto/update-grouping-card.dto';

@Injectable()
export class IngestionService {
  constructor(
    private readonly cardsService: CardsService,
    private readonly readinessService: CardReadinessService,
    @InjectModel(Card.name) private readonly cardModel: Model<Card>,
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

  async autoReview(
    type: IngestionCardType,
    id: string,
    options: { providerOverride?: AiProviderName } = {},
  ) {
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

    const updatePayload = this.buildUpdatePayloadForReview(type, card);

    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.cardsService.updateAuthorCardAndSetPendingReview(
          id,
          updatePayload as UpdateAuthorCardDto,
          { providerOverride: options.providerOverride },
        );
      case IngestionCardType.AnthologyCard:
        return this.cardsService.updateAnthologyCardAndSetPendingReview(
          id,
          updatePayload as UpdateAnthologyCardDto,
          { providerOverride: options.providerOverride },
        );
      case IngestionCardType.MagazineCard:
        return this.cardsService.updateMagazineCardAndSetPendingReview(
          id,
          updatePayload as UpdateMagazineCardDto,
          { providerOverride: options.providerOverride },
        );
      case IngestionCardType.GroupingCard:
        return this.cardsService.updateGroupingCardAndSetPendingReview(
          id,
          updatePayload as UpdateGroupingCardDto,
          { providerOverride: options.providerOverride },
        );
      default:
        throw new BadRequestException('Unsupported card type');
    }
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
    options: {
      autoReview?: boolean;
      autoUpload?: boolean;
      providerOverride?: AiProviderName;
    } = {},
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
      await this.autoReview(type, targetId, {
        providerOverride: options.providerOverride,
      });
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

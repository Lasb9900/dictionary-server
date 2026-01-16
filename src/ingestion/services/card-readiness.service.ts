import { Injectable } from '@nestjs/common';
import { IngestionCardType } from '../dto/ingestion-worksheet.dto';

@Injectable()
export class CardReadinessService {
  getMissingFieldsForReview(type: IngestionCardType, card: any): string[] {
    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.checkRequiredFields(card, ['fullName']);
      case IngestionCardType.AnthologyCard:
        return this.checkRequiredFields(card, ['anthologyTitle']);
      case IngestionCardType.MagazineCard:
        return this.checkRequiredFields(card, ['magazineTitle']);
      case IngestionCardType.GroupingCard:
        return this.checkRequiredFields(card, ['name']);
      default:
        return [];
    }
  }

  getMissingFieldsForUpload(type: IngestionCardType, card: any): string[] {
    switch (type) {
      case IngestionCardType.AuthorCard:
        return this.checkRequiredFields(card, ['fullName', 'title']);
      case IngestionCardType.AnthologyCard:
        return this.checkRequiredFields(card, ['anthologyTitle']);
      case IngestionCardType.MagazineCard:
        return this.checkRequiredFields(card, ['magazineTitle']);
      case IngestionCardType.GroupingCard:
        return this.checkRequiredFields(card, ['name']);
      default:
        return [];
    }
  }

  private checkRequiredFields(card: any, fields: string[]): string[] {
    return fields.filter((field) => {
      const value = card?.[field];
      return value === undefined || value === null || value === '';
    });
  }
}

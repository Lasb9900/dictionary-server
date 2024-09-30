import { Publication } from './publication-place.interface';

export interface Edition {
  publicationDate: string;
  editiontitle: string;
  publicationPlace: Publication;
  language: string;
  translator: string;
}

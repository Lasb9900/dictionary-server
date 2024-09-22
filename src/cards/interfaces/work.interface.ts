import { Multimedia } from './multimedia.interface';
import { Publication } from './publication-place.interface';

export interface Work {
  title?: string;
  originalLanguage?: string;
  genre?: string;
  publicationDate?: string;
  publicationPlace?: Publication;
  description?: string;
  multimedia?: Multimedia[];
  text?: string;
}

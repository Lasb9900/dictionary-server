import { Multimedia } from './multimedia.interface';
import { Publication } from './publication-place.interface';
import { Edition } from '../interfaces/edition.interface';

export interface Work {
  title?: string;
  originalLanguage?: string;
  genre?: string;
  publicationDate?: string;
  publicationPlace?: Publication;
  editions?: Edition[];
  description?: string;
  multimedia?: Multimedia[];
  text?: string;
}

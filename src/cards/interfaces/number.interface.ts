import { Publication } from '../interfaces/publication-place.interface';

export interface MagazineIssue {
  number?: string;
  issueDate?: string;
  publicationPlace?: Publication;
  language?: string;
  translator?: string;
}

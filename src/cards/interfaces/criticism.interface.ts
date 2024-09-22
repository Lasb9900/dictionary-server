import { Multimedia } from './multimedia.interface';

export interface Criticism {
  title?: string;
  type?: string;
  author?: string;
  publicationDate?: string;
  link?: string;
  bibliographicReference?: string;
  description?: string;
  multimedia?: Multimedia[];
  text?: string;
}

import { Prop } from '@nestjs/mongoose';
import { Multimedia } from './multimedia.entity';
import { Publication } from 'src/common/entities/publication.entity';

// Definition of the Work Object

export class Work {
  @Prop({
    unique: true,
  })
  title: string;

  @Prop()
  genre: string;

  @Prop()
  publicationDate: string;

  @Prop({
    type: Publication,
    required: false,
  })
  publicationPlace?: Publication;

  @Prop()
  description: string;

  @Prop()
  originalLanguage: string;

  @Prop({
    type: Multimedia,
    required: false,
  })
  multimedia?: Multimedia;

  @Prop()
  workFile: string;

  @Prop()
  coverImage: string;

  @Prop()
  workAudio: string;
}

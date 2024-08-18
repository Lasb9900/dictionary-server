import { Prop } from '@nestjs/mongoose';
import { Reference } from './reference.entity';

// Definition of the Criticism Object

export class Criticism {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  publicationDate: string;

  @Prop({
    required: false,
    type: Reference,
  })
  bibliographicReference?: Reference;

  @Prop()
  description: string;
}

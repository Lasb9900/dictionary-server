import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Publication } from '../../common/entities/publication.entity';
import { Multimedia } from 'src/cards/entities/multimedia.entity';

// Definition for the "Antología" schema
@Schema()
export class Anthology {
  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true })
  publicationDate: Date;

  @Prop({
    required: false,
    type: Publication,
  })
  publicationPlace?: Publication;

  @Prop()
  description: string;

  @Prop({ required: true })
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
}

export const AnthologySchema = SchemaFactory.createForClass(Anthology);

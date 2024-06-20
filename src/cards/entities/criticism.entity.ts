import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Definition of the Criticism schema
@Schema()
export class Criticism {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  author: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  publicationDate: Date;

  @Prop({ required: true })
  bibliographicReference: {
    publication: string;
    link: string;
  };

  @Prop()
  description: string;
}

export const CriticismSchema = SchemaFactory.createForClass(Criticism);

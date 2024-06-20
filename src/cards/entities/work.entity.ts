import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Definition of the Work schema
@Schema()
export class Work {
  @Prop({
    unique: true,
    required: true,
  })
  title: string;

  @Prop({ required: true })
  genre: string;

  @Prop()
  publicationDate: string;

  @Prop()
  publicationPlace: string;

  @Prop()
  description: string;

  @Prop()
  originalLanguage: string;

  @Prop()
  multimedia: {
    link: string;
    type: string;
    restriction: string;
  };

  @Prop()
  workFile: string;

  @Prop()
  coverImage: string;

  @Prop()
  workAudio: string;
}

export const WorkSchema = SchemaFactory.createForClass(Work);

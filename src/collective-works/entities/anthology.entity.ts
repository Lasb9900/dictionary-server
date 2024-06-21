import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
    required: true,
    type: {
      city: { type: String, required: true },
      printingHouse: { type: String, required: true },
      publisher: { type: String, required: true },
    },
  })
  publicationPlace: {
    city: string;
    printingHouse: string;
    publisher: string;
  };

  @Prop()
  description: string;

  @Prop({ required: true })
  originalLanguage: string;

  @Prop({
    type: {
      link: { type: String },
      type: { type: String },
      restriction: { type: String },
    },
  })
  multimedia: {
    link: string;
    type: string;
    restriction: string;
  };

  @Prop()
  workFile: string;

  @Prop()
  coverImage: string;
}

export const AnthologySchema = SchemaFactory.createForClass(Anthology);

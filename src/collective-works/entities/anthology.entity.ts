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

  @Prop({ required: true })
  publicationPlace: {
    city: string;
    printingHouse: string;
    publisher: string;
  };

  @Prop()
  description: string;

  @Prop({ required: true })
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
}

export const AnthologySchema = SchemaFactory.createForClass(Anthology);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Multimedia } from 'src/cards/entities/multimedia.entity';

// Definition for the "Revista" schema
@Schema()
export class Magazine {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  firstIssueDate: Date;

  @Prop()
  lastIssueDate: Date;

  @Prop({ required: true })
  issuesPublished: number;

  @Prop({ required: true })
  publicationPlace: string;

  @Prop([String])
  creators: string[];

  @Prop([String])
  sections: string[];

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

export const MagazineSchema = SchemaFactory.createForClass(Magazine);

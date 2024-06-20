import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Criticism, CriticismSchema } from './criticism.entity';
import { Author, AuthorSchema } from './author.entity';
import { Work, WorkSchema } from './work.entity';

// Definition of the Card schema
@Schema()
export class Card extends Document {
  @Prop({ type: AuthorSchema, required: true })
  author: Author;

  @Prop({ type: [WorkSchema], required: true })
  works: Work[];

  @Prop({ type: [CriticismSchema], required: true })
  criticisms: Criticism[];
}

export const CardSchema = SchemaFactory.createForClass(Card);

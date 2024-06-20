import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Definition of the Author schema
@Schema()
export class Author {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  dateOfDeath: string;

  @Prop()
  placeOfBirth: string;

  @Prop()
  placeOfDeath: string;

  @Prop()
  gender: string;

  @Prop()
  pseudonym: string;

  @Prop()
  relevantActivities: string;

  @Prop()
  parents: string[];

  @Prop()
  siblings: string[];

  @Prop()
  children: string[];

  @Prop()
  mainTheme: string;

  @Prop()
  mainGenre: string;

  @Prop()
  context: string;

  @Prop()
  image: string;

  @Prop()
  multimedia: {
    link: string;
    type: string;
    restriction: string;
  };

  @Prop()
  audio: string;
}

export const AuthorSchema = SchemaFactory.createForClass(Author);

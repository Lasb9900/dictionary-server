import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Publication } from '../interfaces/publication-place.interface';
import { Multimedia } from '../interfaces/multimedia.interface';
import { CardStatus } from '../interfaces/card-status.interface';
import { Criticism } from '../interfaces/criticism.interface';

@Schema()
export class AnthologyCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];
  observation: string;

  @Prop()
  anthologyTitle: string;

  @Prop()
  genre: string;

  @Prop()
  author: string;

  @Prop()
  originalLanguage: string;

  @Prop()
  publicationDate: string;

  @Prop({
    type: {
      city: { type: String },
      printingHouse: { type: String },
      publisher: { type: String },
    },
    _id: false,
  })
  publicationPlace?: Publication;

  @Prop()
  description: string;

  @Prop()
  multimedia?: Multimedia[];

  @Prop()
  criticism: Criticism[];

  @Prop()
  text: string;
}

export const AnthologyCardSchema = SchemaFactory.createForClass(AnthologyCard);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { CardStatus } from '../interfaces/card-status.interface';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Gender } from '../interfaces/gender.interface';
import { Work } from '../interfaces/work.interface';
import { Criticism } from '../interfaces/criticism.interface';

@Schema()
export class AuthorCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  gender: Gender;

  @Prop()
  pseudonym: string;

  @Prop()
  dateOfBirth: string;

  @Prop()
  dateOfDeath: string;

  @Prop()
  placeOfBirth: string;

  @Prop()
  placeOfDeath: string;

  @Prop()
  relatives: string;

  @Prop()
  relevantActivities: string;

  @Prop()
  mainTheme: string;

  @Prop()
  mainGenre: string;

  @Prop()
  context: string;

  @Prop()
  multimedia?: Multimedia[];

  @Prop()
  works: Work[];

  @Prop()
  criticism: Criticism[];
}

export const AuthorCardSchema = SchemaFactory.createForClass(AuthorCard);

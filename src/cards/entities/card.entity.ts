import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Author } from './author.entity';
import { Work } from './work.entity';
import { Criticism } from './criticism.entity';
import { User } from 'src/users/entities/user.entity';
import { CardStatus } from '../interfaces/card-status.interface';
import { EditHistory } from './editHistory.entity';
import { ReviewHistory } from './reviewHistory.entity';

// Definition of the Card Schema

@Schema()
export class Card extends Document {
  @Prop({ type: Author })
  author: Author;

  @Prop({ type: [Work] })
  works: Work[];

  @Prop({ type: [Criticism] })
  criticisms: Criticism[];

  @Prop({ type: String, unique: true })
  title: string;

  @Prop({ type: String, enum: CardStatus, default: CardStatus.PENDING_EDIT })
  status: CardStatus;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  assignedEditor: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true })
  assignedReviewer: User;

  @Prop({ type: [EditHistory], default: [] })
  editHistory: EditHistory[];

  @Prop({ type: [ReviewHistory], default: [] })
  reviewHistory: ReviewHistory[];
}

export const CardSchema = SchemaFactory.createForClass(Card);

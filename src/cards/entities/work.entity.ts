import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { CardStatus } from '../interfaces/card-status.interface';

@Schema()
export class WorkCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];
  observation: string;

  @Prop()
  authorFullName: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Card' })
  authorCardId: string;

  @Prop()
  originalLanguage?: string;

  @Prop()
  genre?: string;

  @Prop()
  publicationDate?: string;

  @Prop()
  description?: string;

  @Prop()
  text?: string;
}

export const WorkCardSchema = SchemaFactory.createForClass(WorkCard);

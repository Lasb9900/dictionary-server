import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AuthorCard } from './author.entity';
import { AnthologyCard } from './anthology.entity';
import { GroupingCard } from './grouping.entity';
import { MagazineCard } from './magazine.entity';
import { User } from 'src/users/entities/user.entity';
import { CardStatus } from '../interfaces/card-status.interface';
import { MythAndLegendCard } from './mythLegend.entity';

@Schema({ discriminatorKey: 'type' })
export class Card extends Document {
  @Prop({
    type: String,
    enum: [
      AuthorCard.name,
      AnthologyCard.name,
      GroupingCard.name,
      MagazineCard.name,
      MythAndLegendCard.name,
    ],
  })
  type: string;

  @Prop()
  title: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: User;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: String, enum: CardStatus, default: CardStatus.PENDING_EDIT })
  status: CardStatus;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', index: true })
  assignedEditors: User[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', index: true })
  assignedReviewers: User[];

  @Prop({ type: String })
  observation: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);

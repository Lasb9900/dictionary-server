import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class AnthologyCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  anthologyTitle: string;

  @Prop([String])
  authors: string[];
}

export const AnthologyCardSchema = SchemaFactory.createForClass(AnthologyCard);

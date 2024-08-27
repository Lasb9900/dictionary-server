import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class GroupingCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  groupingName: string;

  @Prop([String])
  elements: string[];

  @Prop()
  description: string;
}

export const GroupingCardSchema = SchemaFactory.createForClass(GroupingCard);

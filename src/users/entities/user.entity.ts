import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Card } from 'src/cards/entities/card.entity';
import { CollectiveWorks } from 'src/collective-works/entities/collective-works.entity';
import { UserRoles } from '../interfaces/user-roles.interface';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [String], enum: UserRoles, default: [UserRoles.RESEARCHER] })
  roles: UserRoles[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    default: [],
  })
  assignedCardsAsEditor: Card[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
    default: [],
  })
  assignedCardsAsReviewer: Card[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollectiveWorks' }],
    default: [],
  })
  assignedCollectiveWorksAsEditor: CollectiveWorks[];

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CollectiveWorks' }],
    default: [],
  })
  assignedCollectiveWorksAsReviewer: CollectiveWorks[];
}

export const UserSchema = SchemaFactory.createForClass(User);

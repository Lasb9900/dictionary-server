import { Prop } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import mongoose from 'mongoose';

export class ReviewHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  reviewer: User;

  @Prop({ type: Date, default: Date.now })
  reviewDate: Date;

  @Prop({ type: String })
  notes: string;

  @Prop({ type: Boolean, required: true })
  accepted: boolean;
}

import { Prop } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import mongoose from 'mongoose';

export class EditHistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  editor: User;

  @Prop({ type: Date, default: Date.now })
  editDate: Date;
}

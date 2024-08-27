import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';

@Schema()
export class MagazineCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  magazineTitle: string;

  @Prop([String])
  issues: string[];

  @Prop()
  publicationFrequency: string;
}

export const MagazineCardSchema = SchemaFactory.createForClass(MagazineCard);

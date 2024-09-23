import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { MagazineCreator } from '../interfaces/magazine-creator.interface';
import { Multimedia } from '../interfaces/multimedia.interface';
import { CardStatus } from '../interfaces/card-status.interface';
import { Criticism } from '../interfaces/criticism.interface';
import { MagazineIssue } from '../interfaces/number.interface';

@Schema()
export class MagazineCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];
  observation: string;

  @Prop()
  magazineTitle: string;

  @Prop()
  originalLanguage: string;

  @Prop({ type: [Object] })
  numbers: MagazineIssue[];

  @Prop()
  creators: MagazineCreator[];

  @Prop()
  sections: string;

  @Prop()
  description: string;

  @Prop()
  multimedia?: Multimedia[];

  @Prop()
  criticism: Criticism[];

  @Prop()
  text: string;
}

export const MagazineCardSchema = SchemaFactory.createForClass(MagazineCard);

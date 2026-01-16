import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Multimedia } from '../interfaces/multimedia.interface';
import { Criticism } from '../interfaces/criticism.interface';
import { User } from '../../users/entities/user.entity';
import { CardStatus } from '../interfaces/card-status.interface';
import { MlType } from '../interfaces/mlType.interface';

@Schema()
export class MythAndLegendCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];
  observation: string;

  @Prop()
  mlTitle: string;

  @Prop()
  mlType: MlType;

  @Prop()
  creatorCommunity: string;

  @Prop()
  diffusionPlace: string;

  @Prop()
  originalLanguage: string;

  @Prop()
  fullText: string;

  @Prop()
  mainTheme: string;

  @Prop()
  description: string;

  @Prop()
  multimedia?: Multimedia[];

  @Prop()
  criticism: Criticism[];
}

export const MythAndLegendCardSchema =
  SchemaFactory.createForClass(MythAndLegendCard);

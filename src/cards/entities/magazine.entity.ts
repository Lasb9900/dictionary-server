import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Publication } from '../interfaces/publication-place.interface';
import { User } from 'src/users/entities/user.entity';
import { MagazineCreator } from '../interfaces/magazine-creator.interface';
import { Multimedia } from '../interfaces/multimedia.interface';
import { CardStatus } from '../interfaces/card-status.interface';
import { Criticism } from '../interfaces/criticism.interface';

@Schema()
export class MagazineCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  magazineTitle: string;

  @Prop()
  originalLanguage: string;

  @Prop()
  firstIssueDate: string;

  @Prop()
  lastIssueDate: string;

  @Prop()
  issuesPublished: number;

  @Prop({
    type: {
      city: { type: String },
      printingHouse: { type: String },
      publisher: { type: String },
    },
  })
  publicationPlace: Publication;

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
}

export const MagazineCardSchema = SchemaFactory.createForClass(MagazineCard);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { MeetingPlace } from '../interfaces/meeting-place.interface';
import { Multimedia } from '../interfaces/multimedia.interface';
import { GroupPublication } from '../interfaces/group-publication.interface';
import { CardStatus } from '../interfaces/card-status.interface';
import { Criticism } from '../interfaces/criticism.interface';

@Schema()
export class GroupingCard {
  type: string;
  title: string;
  createdBy: User;
  createdAt: Date;
  status: CardStatus;
  assignedEditors: User[];
  assignedReviewers: User[];

  @Prop()
  name: string;

  @Prop({
    type: {
      city: { type: String },
      municipality: { type: String },
    },
  })
  meetingPlace?: MeetingPlace;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  generalCharacteristics: string;

  @Prop([String])
  members: string[];

  @Prop()
  groupPublications?: GroupPublication[];

  @Prop()
  groupActivities: string;

  @Prop()
  multimedia?: Multimedia[];

  @Prop()
  criticism: Criticism[];

  @Prop()
  text: string;
}

export const GroupingCardSchema = SchemaFactory.createForClass(GroupingCard);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { GroupPublication } from './group-publication.entity';
import { Location } from 'src/cards/entities/location.entity';

// Definition for the "Agrupación" schema
@Schema()
export class Grouping {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: Location,
    required: false,
  })
  meetingPlace?: Location;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  generalCharacteristics: string;

  @Prop([String])
  members: string[];

  @Prop([GroupPublication])
  groupPublications?: GroupPublication[];

  @Prop()
  groupActivities: string;
}

export const GroupingSchema = SchemaFactory.createForClass(Grouping);

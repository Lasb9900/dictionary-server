import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Definition for the "Agrupación" schema
@Schema()
export class Grouping {
  @Prop({ required: true })
  name: string;

  @Prop()
  meetingPlace: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate: string;

  @Prop()
  generalCharacteristics: string;

  @Prop([String])
  members: string[];

  @Prop([
    {
      title: { type: String, required: true },
      year: { type: Number, required: true },
      summary: { type: String },
    },
  ])
  groupPublications: {
    title: string;
    year: number;
    summary?: string;
  }[];

  @Prop()
  groupActivities: string;
}

export const GroupingSchema = SchemaFactory.createForClass(Grouping);

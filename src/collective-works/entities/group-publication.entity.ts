import { Prop } from '@nestjs/mongoose';

// Definition of the Group Publication Object

export class GroupPublication {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Number, required: true })
  year: number;

  @Prop({ type: String, required: true })
  summary: string;
}

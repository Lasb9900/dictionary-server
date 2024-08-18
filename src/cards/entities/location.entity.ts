import { Prop } from '@nestjs/mongoose';

// Definition of the Location Object

export class Location {
  @Prop({ type: String, required: false })
  city: string;

  @Prop({ type: String, required: false })
  municipality: string;

  @Prop({ type: String, required: false })
  state: string;

  @Prop({ type: String, required: false })
  country: string;
}

import { Prop } from '@nestjs/mongoose';

// Definition of the Multimedia Object

export class Multimedia {
  @Prop({ type: String, required: true })
  link: string;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  restriction: string;
}

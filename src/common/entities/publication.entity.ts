import { Prop } from '@nestjs/mongoose';

// Definition of the Publication Object

export class Publication {
  @Prop({ type: String, required: true })
  city: string;

  @Prop({ type: String, required: true })
  printingHouse: string;

  @Prop({ type: String, required: true })
  publisher: string;
}

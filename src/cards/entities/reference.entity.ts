import { Prop } from '@nestjs/mongoose';

// Definition of the Reference Object

export class Reference {
  @Prop({ type: String, required: true })
  link: string;

  @Prop({ type: String, required: true })
  publication: string;
}

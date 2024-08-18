import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Criticism } from 'src/cards/entities/criticism.entity';

// Base schema for CollectiveWork
@Schema({ discriminatorKey: 'type' })
export class CollectiveWorks extends Document {
  @Prop({
    type: String,
    required: true,
    enum: ['Grouping', 'Magazine', 'Anthology'],
  })
  type: string;
  @Prop({ type: [Criticism], required: true })
  criticisms: Criticism[];
}

export const CollectiveWorkSchema =
  SchemaFactory.createForClass(CollectiveWorks);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Base schema for CollectiveWork
@Schema({ discriminatorKey: 'type' })
export class CollectiveWorks extends Document {
  @Prop({
    type: String,
    required: true,
    enum: ['Grouping', 'Magazine', 'Anthology'],
  })
  type: string;
}

export const CollectiveWorkSchema =
  SchemaFactory.createForClass(CollectiveWorks);

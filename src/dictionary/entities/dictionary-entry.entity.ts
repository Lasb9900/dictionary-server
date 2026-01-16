import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class DictionaryEntry {
  @Prop({ required: true, unique: true, index: true })
  term: string;

  @Prop({ required: true })
  definition: string;

  @Prop({ type: [String], default: [] })
  examples: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: [String], default: [] })
  sources: string[];

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const DictionaryEntrySchema =
  SchemaFactory.createForClass(DictionaryEntry);

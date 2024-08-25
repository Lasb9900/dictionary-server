import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoles } from '../interfaces/user-roles.interface';

@Schema()
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [String], enum: UserRoles, default: [UserRoles.RESEARCHER] })
  roles: UserRoles[];

  @Prop({ default: '' })
  imageUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

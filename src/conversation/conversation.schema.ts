import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema()
export class Conversation {
  @Prop()
  type: 'direct' | 'group';

  @Prop()
  name?: string;

  @Prop()
  participants: Types.ObjectId[];

  @Prop()
  lastMessage?: Types.ObjectId;

  @Prop()
  createdBy?: Types.ObjectId;

  @Prop()
  avatar?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';

export type SidDocument = HydratedDocument<Sid>;

@Schema({expires: 10})
export class Sid {
    @Prop({required: true, unique: true,})
    sid: string
    @Prop({required: true, unique: true})
    nonce: string
    
    @Prop({default: new Date()})
    createdAt: Date
}
export const SidSchema = SchemaFactory.createForClass(Sid);
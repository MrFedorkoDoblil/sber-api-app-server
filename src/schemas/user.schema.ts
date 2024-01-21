import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({required: true, unique: true,})
    login: string;

    @Prop({required: true})
    password: string

    @Prop({unique: true})
    sub: string;

    @Prop({unique: true})
    refreshToken: string;

    @Prop({unique: true})
    idToken: string;

    @Prop({default: ''})
    orgKpp: string;

    @Prop({default: ''})
    OrgName: string;

    @Prop({default: ''})
    orgActualAddress: string;
    
}

export const UserSchema = SchemaFactory.createForClass(User);
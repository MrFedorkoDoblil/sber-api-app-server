import { Document, Types } from "mongoose";

export function schemaHas<T>(
    doc: Document<unknown, T> & T & {_id: Types.ObjectId;},
    key:string,
    ): boolean{
    const plain = doc.toObject();
    return plain.hasOwnProperty(key)
}
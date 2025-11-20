import mongoose, { Schema, Document } from "mongoose";

export interface IClub extends Document {
    name: string;
}

const ClubSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
});

export default mongoose.model<IClub>("Club", ClubSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
    name: string;
    uniqueId: string;
    clubId?: mongoose.Types.ObjectId;
    events: mongoose.Types.ObjectId[];
}

const PlayerSchema: Schema = new Schema({
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    clubId: { type: Schema.Types.ObjectId, ref: "Club" },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
});

export default mongoose.model<IPlayer>("Player", PlayerSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
    name: string;
    uniqueId: string;
    clubName?: string;
    clubId?: mongoose.Types.ObjectId;
    events: mongoose.Types.ObjectId[];
}

const PlayerSchema: Schema = new Schema({
    name: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true, index: true },
    clubName: { type: String },
    clubId: { type: Schema.Types.ObjectId, ref: "Club" },
    events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    teams: [{ type: Schema.Types.ObjectId, ref: "Team" }], // Track teams player belongs to
});

// Add compound index for faster event-player lookups
PlayerSchema.index({ uniqueId: 1, events: 1 });

export default mongoose.model<IPlayer>("Player", PlayerSchema);

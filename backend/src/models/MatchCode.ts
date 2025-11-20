import mongoose, { Schema, Document } from "mongoose";

export interface IMatchCode extends Document {
    matchId: mongoose.Types.ObjectId;
    codeHash: string;
    expiresAt: Date;
    used: boolean;
}

const MatchCodeSchema: Schema = new Schema({
    matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
});

export default mongoose.model<IMatchCode>("MatchCode", MatchCodeSchema);

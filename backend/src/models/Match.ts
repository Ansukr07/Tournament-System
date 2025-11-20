import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    eventId: mongoose.Types.ObjectId;
    round: number;
    participants: {
        playerId?: mongoose.Types.ObjectId;
        placeholder?: string;
    }[];
    courtId?: string;
    startTime?: Date;
    endTime?: Date;
    status: "scheduled" | "in_progress" | "completed" | "pending";
    winnerId?: mongoose.Types.ObjectId;
    matchCodeId?: mongoose.Types.ObjectId;
    umpireId?: mongoose.Types.ObjectId;
    matchNumber?: number;
}

const MatchSchema: Schema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    round: { type: Number, required: true },
    participants: [
        {
            playerId: { type: Schema.Types.ObjectId, ref: "Player" },
            placeholder: { type: String },
        },
    ],
    courtId: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "pending"],
        default: "pending",
    },
    winnerId: { type: Schema.Types.ObjectId, ref: "Player" },
    matchCodeId: { type: Schema.Types.ObjectId, ref: "MatchCode" },
    umpireId: { type: Schema.Types.ObjectId, ref: "User" },
    matchNumber: { type: Number },
});

export default mongoose.model<IMatch>("Match", MatchSchema);

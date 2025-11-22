import mongoose, { Schema, Document } from "mongoose";

export interface IMatch extends Document {
    eventId: mongoose.Types.ObjectId;
    round: number;
    participants: {
        teamId?: mongoose.Types.ObjectId;
        placeholder?: string;
    }[];
    courtId?: string;
    startTime?: Date;
    endTime?: Date;
    status: "scheduled" | "in_progress" | "completed" | "pending" | "auto_advance";
    winnerId?: mongoose.Types.ObjectId;
    matchCodeId?: mongoose.Types.ObjectId;
    umpireId?: mongoose.Types.ObjectId;
    matchNumber?: number;
    matchCode?: string; // Added matchCode
    nextMatchId?: mongoose.Types.ObjectId;
}

const MatchSchema: Schema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    round: { type: Number, required: true },
    participants: [
        {
            teamId: { type: Schema.Types.ObjectId, ref: "Team" },
            placeholder: { type: String },
        },
    ],
    courtId: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    status: {
        type: String,
        enum: ["scheduled", "in_progress", "completed", "pending", "auto_advance"],
        default: "pending",
    },
    winnerId: { type: Schema.Types.ObjectId, ref: "Team" },
    matchCodeId: { type: Schema.Types.ObjectId, ref: "MatchCode" },
    umpireId: { type: Schema.Types.ObjectId, ref: "User" },
    matchNumber: { type: Number },
    matchCode: { type: String }, // Added matchCode
    nextMatchId: { type: Schema.Types.ObjectId, ref: "Match" },
});

export default mongoose.model<IMatch>("Match", MatchSchema);

import mongoose, { Schema, Document } from "mongoose";

export interface ITeamStats extends Document {
    eventId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    played: number;
    won: number;
    lost: number;
    draw: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
}

const TeamStatsSchema: Schema = new Schema(
    {
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        draw: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        goalsFor: { type: Number, default: 0 },
        goalsAgainst: { type: Number, default: 0 },
        goalDifference: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Compound index to ensure one stats entry per team per event
TeamStatsSchema.index({ eventId: 1, teamId: 1 }, { unique: true });

export default mongoose.model<ITeamStats>("TeamStats", TeamStatsSchema);

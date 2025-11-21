import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember {
    name: string;
    age: number;
    gender: "male" | "female" | "other";
    uniqueId: string;
}

export interface ITeam extends Document {
    teamName: string;
    clubName: string;
    clubId: mongoose.Types.ObjectId;
    members: ITeamMember[];
    events: mongoose.Types.ObjectId[];
    teamId: string;
    createdAt: Date;
}

const TeamMemberSchema = new Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    uniqueId: { type: String, required: true },
});

const TeamSchema: Schema = new Schema(
    {
        teamName: { type: String, required: true },
        clubName: { type: String, required: true },
        clubId: { type: Schema.Types.ObjectId, ref: "Club" },
        members: [TeamMemberSchema],
        events: [{ type: Schema.Types.ObjectId, ref: "Event" }],
        teamId: { type: String, unique: true },
    },
    { timestamps: true }
);

// Generate unique teamId before saving
TeamSchema.pre("save", function (next) {
    if (!this.teamId) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        this.teamId = `T-${timestamp}-${random}`;
    }
    next();
});

export default mongoose.model<ITeam>("Team", TeamSchema);

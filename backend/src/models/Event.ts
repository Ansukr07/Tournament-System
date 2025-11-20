import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
    name: string;
    category: string;
    type: "knockout" | "round_robin";
    matchDuration: number;
    bufferMinutes: number;
    courts: string[];
    startDate?: Date;
    endDate?: Date;
}

const EventSchema: Schema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["knockout", "round_robin"], required: true },
    matchDuration: { type: Number, required: true },
    bufferMinutes: { type: Number, default: 5 },
    courts: [{ type: String }],

    // ADD THESE:
    startDate: { type: Date },
    endDate: { type: Date },
});

export default mongoose.model<IEvent>("Event", EventSchema);

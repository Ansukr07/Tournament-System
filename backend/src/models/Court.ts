import mongoose, { Schema, type Document } from "mongoose"

export interface ICourt extends Document {
  eventId: mongoose.Types.ObjectId
  name: string
  capacity: number
  createdAt: Date
}

const courtSchema = new Schema<ICourt>({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model<ICourt>("Court", courtSchema)

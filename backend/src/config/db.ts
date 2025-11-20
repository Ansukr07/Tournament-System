import mongoose from "mongoose"

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://anznup_db_user:RN163lEuOLDtXU40@cluster0.1phvdng.mongodb.net/tournament-engine")
    console.log("MongoDB connected:", conn.connection.host)
    return conn
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}

export default connectDB

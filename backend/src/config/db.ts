import mongoose from "mongoose"

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ MONGODB_URI is missing in environment variables.")
      process.exit(1)
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI)

    console.log("MongoDB connected:", conn.connection.host)
    return conn

  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

export default connectDB

import mongoose from "mongoose";
import TeamStats from "./src/models/TeamStats";
import dotenv from "dotenv";

dotenv.config();

const clearLeaderboard = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "");
        console.log("Connected to MongoDB");

        const result = await TeamStats.deleteMany({});
        console.log(`✅ Deleted ${result.deletedCount} team stats entries`);

        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing leaderboard:", error);
        process.exit(1);
    }
};

clearLeaderboard();

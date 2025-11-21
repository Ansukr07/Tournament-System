import mongoose from "mongoose";
import Player from "../models/Player";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const checkRegistrations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("✓ Connected to MongoDB\n");

        const eventId = "691f4f9a44819ed0d3e23501";

        // Find all players registered to this event
        const registeredPlayers = await Player.find({
            events: new mongoose.Types.ObjectId(eventId)
        });

        console.log(`📋 Players registered to event ${eventId}:`);
        console.log(`   Total: ${registeredPlayers.length}\n`);

        registeredPlayers.forEach((player, index) => {
            console.log(`${index + 1}. ${player.name}`);
            console.log(`   ID: ${player.uniqueId}`);
            console.log(`   Club: ${player.clubName || 'N/A'}`);
            console.log(`   Events: [${player.events.join(', ')}]\n`);
        });

        // Find the most recent player
        const recentPlayer = await Player.findOne().sort({ _id: -1 });
        console.log(`🆕 Most recent player:`);
        console.log(`   Name: ${recentPlayer?.name}`);
        console.log(`   ID: ${recentPlayer?.uniqueId}`);
        console.log(`   Club: ${recentPlayer?.clubName || 'N/A'}`);
        console.log(`   Events: [${recentPlayer?.events.join(', ')}]`);
        console.log(`   Registered to target event: ${recentPlayer?.events.some(e => e.toString() === eventId) ? 'YES' : 'NO'}`);

    } catch (error: any) {
        console.error("\n✗ Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

checkRegistrations();

import mongoose from "mongoose";
import Player from "../models/Player";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const testSave = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("✓ Connected to MongoDB");

        // Find the most recently created player
        const player = await Player.findOne().sort({ _id: -1 });

        if (!player) {
            console.log("✗ No players found in database");
            return;
        }

        console.log("\n📋 Player Info:");
        console.log(`  Name: ${player.name}`);
        console.log(`  ID: ${player.uniqueId}`);
        console.log(`  Events BEFORE: [${player.events.join(', ')}]`);
        console.log(`  Events count: ${player.events.length}`);

        // Try to add an event
        const testEventId = new mongoose.Types.ObjectId("691f4f9a44819ed0d3e23501");
        console.log(`\n🔧 Adding event: ${testEventId}`);

        player.events.push(testEventId);
        console.log(`  Events AFTER push: [${player.events.join(', ')}]`);

        // Save
        console.log("\n💾 Saving...");
        const saved = await player.save();
        console.log("✓ Save completed");
        console.log(`  Events in saved object: [${saved.events.join(', ')}]`);

        // Re-fetch from database
        console.log("\n🔍 Re-fetching from database...");
        const refetched = await Player.findById(player._id);
        console.log(`  Events in database: [${refetched?.events.join(', ')}]`);
        console.log(`  Events count: ${refetched?.events.length}`);

        if (refetched?.events.length === player.events.length) {
            console.log("\n✓ SUCCESS: Events were saved to database!");
        } else {
            console.log("\n✗ FAILURE: Events were NOT saved to database!");
        }

    } catch (error: any) {
        console.error("\n✗ Error:", error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
};

testSave();

import mongoose from "mongoose";
import Player from "../models/Player";
import Event from "../models/Event";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const inspectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("Connected to MongoDB");
        console.log("Database:", mongoose.connection.db.databaseName);
        console.log("=".repeat(80));

        // Get all players
        const players = await Player.find().lean();
        console.log(`\nTotal players: ${players.length}`);
        console.log("=".repeat(80));

        players.forEach((player, index) => {
            console.log(`\nPlayer ${index + 1}:`);
            console.log(`  Name: ${player.name}`);
            console.log(`  Unique ID: ${player.uniqueId}`);
            console.log(`  Club Name: ${player.clubName || 'N/A'}`);
            console.log(`  Club ID: ${player.clubId || 'N/A'}`);
            console.log(`  Events array: ${JSON.stringify(player.events)}`);
            console.log(`  Events count: ${player.events?.length || 0}`);
            console.log(`  Full document: ${JSON.stringify(player, null, 2)}`);
        });

        console.log("\n" + "=".repeat(80));

        // Get all events
        const events = await Event.find().lean();
        console.log(`\nTotal events: ${events.length}`);
        console.log("=".repeat(80));

        events.forEach((event, index) => {
            console.log(`\nEvent ${index + 1}:`);
            console.log(`  Name: ${event.name}`);
            console.log(`  ID: ${event._id}`);
            console.log(`  Category: ${event.category}`);
            console.log(`  Type: ${event.type}`);
        });

        // Try to manually update a player to test if save works
        console.log("\n" + "=".repeat(80));
        console.log("\nTesting manual update...");

        if (players.length > 0 && events.length > 0) {
            const testPlayer = await Player.findById(players[0]._id);
            const testEventId = events[0]._id;

            console.log(`\nAttempting to add event ${testEventId} to player ${testPlayer?.uniqueId}`);
            console.log(`Events before: ${JSON.stringify(testPlayer?.events)}`);

            if (testPlayer) {
                testPlayer.events.push(testEventId as any);
                console.log(`Events after push: ${JSON.stringify(testPlayer.events)}`);

                const saved = await testPlayer.save();
                console.log(`Save completed!`);
                console.log(`Events after save: ${JSON.stringify(saved.events)}`);

                // Re-fetch to verify
                const refetched = await Player.findById(players[0]._id).lean();
                console.log(`Events after refetch: ${JSON.stringify(refetched?.events)}`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
};

inspectDatabase();

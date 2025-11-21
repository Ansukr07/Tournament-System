import mongoose from "mongoose";
import Player from "../models/Player";
import Event from "../models/Event";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const checkParticipants = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("Connected to MongoDB");

        const events = await Event.find();
        console.log("Total events found:", events.length);
        events.forEach(e => console.log(` - Event: ${e.name} (${e._id})`));

        const players = await Player.find();
        console.log("Total players found:", players.length);
        players.forEach(p => {
            console.log(` - Player: ${p.name} (${p.uniqueId})`);
            console.log(`   Events: ${JSON.stringify(p.events)}`);
        });

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkParticipants();

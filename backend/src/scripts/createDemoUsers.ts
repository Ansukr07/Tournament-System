import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const createDemoUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("Connected to MongoDB");

        // Demo users configuration
        const demoUsers = [
            { email: "admin@demo.com", password: "admin123", role: "admin" as const },
            { email: "umpire@demo.com", password: "umpire123", role: "umpire" as const }
        ];

        for (const userData of demoUsers) {
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`${userData.role} user already exists: ${userData.email}`);
            } else {
                const salt = await bcrypt.genSalt(10);
                const passwordHash = await bcrypt.hash(userData.password, salt);

                const newUser = new User({
                    email: userData.email,
                    passwordHash,
                    role: userData.role,
                });

                await newUser.save();
                console.log(`✅ ${userData.role.toUpperCase()} user created`);
                console.log(`   Email: ${userData.email}`);
                console.log(`   Password: ${userData.password}`);
            }
        }

        console.log("\n🎉 Demo users setup complete!");
        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating demo users:", error);
        process.exit(1);
    }
};

createDemoUsers();

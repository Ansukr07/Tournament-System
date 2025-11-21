import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/xthlete");
        console.log("Connected to MongoDB");

        const email = "admin@example.com";
        const password = "admin123";
        const role = "admin";

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Admin user already exists");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password} (if not changed)`);
        } else {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            const newUser = new User({
                email,
                passwordHash,
                role,
            });

            await newUser.save();
            console.log("Admin user created successfully");
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error creating admin user:", error);
        process.exit(1);
    }
};

createAdmin();

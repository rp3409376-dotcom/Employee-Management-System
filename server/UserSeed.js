import bcrypt from "bcrypt";
import mongoose from "mongoose";
import connectToDatabase from "./db/db.js";
import User from "./models/User.js";

const userRegister = async () => {
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    const previousEmail = process.env.ADMIN_PREVIOUS_EMAIL?.trim().toLowerCase();

    if (!name || !email || !password || password.length < 12) {
        throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, and an ADMIN_PASSWORD of at least 12 characters in server/.env.");
    }

    try {
        await connectToDatabase();
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.role !== "admin") {
            throw new Error("This email belongs to an employee account. Choose a different ADMIN_EMAIL.");
        }

        const previousAdmin = previousEmail
            ? await User.findOne({ email: previousEmail, role: "admin" })
            : null;
        if (previousEmail && !previousAdmin) {
            throw new Error("The ADMIN_PREVIOUS_EMAIL account was not found as an admin; no account was changed.");
        }
        if (
            existingUser &&
            previousAdmin &&
            String(existingUser._id) !== String(previousAdmin._id)
        ) {
            throw new Error("ADMIN_EMAIL belongs to a different admin account; no account was changed.");
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const userToUpdate = existingUser || previousAdmin;
        const user = userToUpdate
            ? await User.findByIdAndUpdate(
                userToUpdate._id,
                { name, email, password: hashedPassword },
                { returnDocument: "after", runValidators: true },
            )
            : await User.create({ name, email, password: hashedPassword, role: "admin" });

        console.log(`Admin account is ready for ${user.email}. Sign in with the credentials from server/.env.`);
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

try {
    await userRegister();
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
}
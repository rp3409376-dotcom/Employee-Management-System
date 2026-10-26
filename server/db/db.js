import mongoose from "mongoose";

const connectToDatabase = async () => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
};

export default connectToDatabase;
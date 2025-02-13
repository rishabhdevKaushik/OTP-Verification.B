import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in environment variables.");
        }

        await mongoose.connect(process.env.MONGODB_URL);

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error(`Error while connecting to MongoDB:\n${error.message}`);
        process.exit(1);
    }
};

export default connectDB;

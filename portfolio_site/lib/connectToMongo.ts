import mongoose from "mongoose";

const URI = process.env.MONGO_URI as string;
if (!URI) {
    throw new Error(
        "Mongo URI not found in environment variables"
    );
}

export const connectToMongo = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            return;
        }
        await mongoose.connect(URI);

        console.log("Connected to MongoDB");

    } catch (error) {
        console.error(
            "Error connecting to MongoDB:",
            error
        );

        throw error;
    }
};

export default connectToMongo;
import { MongoClient } from "mongodb";
let client;
let db;
export const connectDB = async () => {
    if (db) {
        return db;
    }
    try {
        // Create a new MongoClient and connect to the database
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        // Select the database specified in the environment variable
        db = client.db(process.env.DB_NAME);
        console.log("Connected to MongoDB: Admin Service");
        return db;
    }
    catch (error) {
        console.error("Error connecting to MongoDB: Admin Service ", error);
        throw error;
    }
};

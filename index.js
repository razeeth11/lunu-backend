import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import router from "./router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URL = process.env.MONGO_URL;

// Update MongoDB connection options
const client = new MongoClient(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to MongoDB");

        app.use(express.json());
        app.use(cors());
        app.use("/", router);

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err);
            if (err.name === "ValidationError" || err.name === "MongoError") {
                res.status(400).json({ error: err.message });
            } else {
                res.status(500).json({ error: "Internal Server Error" });
            }
        });

        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error("Error starting server:", error);
    }
}

startServer();

export { app, client };

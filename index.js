import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import router from "./Routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGO_URL = 'mongodb+srv://lunu:lunu1234@cluster0.mxmqnga.mongodb.net/';
export const secretKey = 'mysecretkeyissecret';

let client;

async function connectDB() {
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the process if DB connection fails
  }
}

app.use(express.json());
app.use(cors());
app.use("/", router);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});

export { app, client };

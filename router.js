import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as db from "./db.js";

const router = express.Router();

router.post("/signup", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: "Username, email, and password are required" });
        }

        const existingUser = await db.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const userID = `${username.toUpperCase()}${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.signupUser(username, email, hashedPassword, userID);
        await db.createCollectionByUserID(userID, username, email);

        res.status(200).json({ message: "Successfully signed up", userID });
    } catch (error) {
        next(error);
    }
});

router.post("/login", async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await db.findUserByEmail(email);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }

        const token = jwt.sign({ userID: user.userID }, process.env.SECRET_KEY, { expiresIn: "1h" });

        res.status(200).json({
            message: "Successfully logged in",
            userID: user.userID,
            token,
        });
    } catch (error) {
        next(error);
    }
});

router.post("/leaveApplication", async (req, res, next) => {
    try {
        // Your leave application logic
    } catch (error) {
        next(error);
    }
});

router.get("/leaveApplicationHistory/:userID", async (req, res, next) => {
    try {
        const { userID } = req.params;
        if (!userID) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const leaveHistory = await db.getLeaveApplicationHistory(userID);
        res.json({ leaveHistory });
    } catch (error) {
        next(error);
    }
});

router.get("/userDetail/:userID", async (req, res, next) => {
    try {
        const { userID } = req.params;
        if (!userID) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const userDetail = await db.getUserDetail(userID);
        if (!userDetail) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ userDetail });
    } catch (error) {
        next(error);
    }
});

export default router;

import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import {
  createCollectionByUserID,
  createLeaveApplication,
  findUserByEmail,
  getUserByUserID,
  signupUser,
  updateLeavePermissions,
} from "./db.js";
import { client, secretKey } from "./index.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const getUserEmail = findUserByEmail();

    const userEmail = await getUserEmail(email);

    if (userEmail) {
      return res.status(400).send({ status: 0, message: "User already exists" });
    }

    const userID = `${username.toUpperCase()}${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    await signupUser(username, email, hashedPassword, userID);
    await createCollectionByUserID(userID, username, email);
    res.status(200).send({ status: 1, message: "Successfully signed up", userID });
  } catch (error) {
    res.status(500).send({ status: 0, message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const getUserEmail = findUserByEmail();
    const userEmail = await getUserEmail(email);

    if (!userEmail) {
      return res.status(400).send({ status: 0, message: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, userEmail.password);
    if (!isPasswordValid) {
      return res.status(400).send({ status: 0, message: "Invalid Credentials" });
    }

    const token = jwt.sign({ userID: userEmail.userID }, secretKey, {
      expiresIn: "1h",
    });
    res.status(200).send({
      status: 1,
      message: "Successfully logged in",
      userID: userEmail.userID,
      token,
    });
  } catch (error) {
    res.status(500).send({ status: 0, message: "Internal server error" });
  }
});

router.post("/leaveApplication", async (req, res) => {
  try {
    const { userID, leaveType, startDate, endDate, leaveReason } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDifference = end.getTime() - start.getTime();
    const positiveDaysDifference = Math.abs(timeDifference / (1000 * 3600 * 24));

    const getUserID = getUserByUserID();
    const user = await getUserID(userID);

    await createLeaveApplication(
      userID,
      leaveType,
      startDate,
      endDate,
      leaveReason,
      positiveDaysDifference
    );

    await updateLeavePermissions(userID, user, positiveDaysDifference);

    res.status(200).send({
      status: 1,
      message: "Successfully permission updated!",
    });
  } catch (error) {
    res.status(500).send({ status: 0, message: "Internal server error" });
  }
});

router.get("/leaveApplicationHistory/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const leaveHistory = await client
      .db("lunu1")
      .collection("leaveApplication")
      .find({ userID })
      .toArray();

    res.status(200).send({ status: 1, leaveHistory });
  } catch (error) {
    res.status(500).send({ status: 0, message: "Internal server error" });
  }
});

router.get("/userDetail/:userID", async (req, res) => {
  try {
    const { userID } = req.params;

    const userDetail = await client
      .db("lunu1")
      .collection("usersDetails")
      .findOne({ userID });

    res.status(200).send({ status: 1, userDetail });
  } catch (error) {
    res.status(500).send({ status: 0, message: "Internal server error" });
  }
});

export default router;

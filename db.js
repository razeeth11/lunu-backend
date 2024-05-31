import { client } from "./index.js";

export async function updateLeavePermissions(userID, user, positiveDaysDifference) {
    try {
        await client.db("lunu1").collection("usersDetails").updateOne(
            { userID },
            { $set: { permissions: user.permissions - positiveDaysDifference } }
        );
    } catch (error) {
        throw error;
    }
}

export async function createLeaveApplication(userID, leaveType, startDate, endDate, leaveReason, positiveDaysDifference) {
    try {
        await client.db("lunu1").collection("leaveApplication").insertOne({
            userID,
            leaveType,
            startDate,
            endDate,
            leaveReason,
            positiveDaysDifference,
        });
    } catch (error) {
        throw error;
    }
}

export async function getUserByUserID(userID) {
    try {
        const user = await client.db("lunu1").collection("usersDetails").findOne({ userID });
        return user;
    } catch (error) {
        throw error;
    }
}

export async function createCollectionByUserID(userID, username, email) {
    try {
        await client.db("lunu1").collection(userID).insertOne({
            username,
            email,
            userID,
        });
    } catch (error) {
        throw error;
    }
}

export async function signupUser(username, email, hashedPassword, userID) {
    try {
        await client.db("lunu1").collection("usersDetails").insertOne({
            username,
            email,
            password: hashedPassword,
            userID,
            permissions: 21,
        });
    } catch (error) {
        throw error;
    }
}

export async function findUserByEmail(email) {
    try {
        const user = await client.db("lunu1").collection("usersDetails").findOne({ email });
        return user;
    } catch (error) {
        throw error;
    }
}

export async function getLeaveApplicationHistory(userID) {
    try {
        const leaveHistory = await client.db("lunu1").collection("leaveApplication").find({ userID }).toArray();
        return leaveHistory;
    } catch (error) {
        throw error;
    }
}

export async function getUserDetail(userID) {
    try {
        const userDetail = await client.db("lunu1").collection("usersDetails").findOne({ userID });
        return userDetail;
    } catch (error) {
        throw error;
    }
}

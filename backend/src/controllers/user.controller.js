import httpStatus from "http-status";
import { User } from "../models/user.model.js";
import bcrypt, { hash } from "bcrypt"

import crypto from "crypto"
import { Meeting } from "../models/meeting.model.js";
const login = async (req, res) => {

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please Provide" })
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User Not Found" })
        }


        let isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (isPasswordCorrect) {
            let token = crypto.randomBytes(20).toString("hex");

            user.token = token;
            await user.save();
            return res.status(httpStatus.OK).json({ token: token })
        } else {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid Username or password" })
        }

    } catch (e) {
        return res.status(500).json({ message: `Something went wrong ${e}` })
    }
}


const register = async (req, res) => {
    // 1. Log the incoming data
    console.log("--> Received request to register user. Body:", req.body);
    const { name, username, password } = req.body;

    // A small check to make sure you're getting the data
    if (!name || !username || !password) {
        console.log("Validation Failed: A required field is missing.");
        return res.status(400).json({ message: "Name, username, and password are required." });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists:", username);
            // Use a 409 Conflict status code for existing users
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name: name,
            username: username,
            password: hashedPassword
        });

        // 2. Log the user object before saving
        console.log("Attempting to save new user:", newUser);

        await newUser.save();

        // 3. Log on success
        console.log("✅ SUCCESS: User registered successfully!", newUser.username);

        res.status(201).json({ message: "User Registered" }); // Use 201 for created

    } catch (e) {
        // 4. THIS IS THE MOST IMPORTANT PART!
        console.error("❌ ERROR DURING REGISTRATION:", e);

        // Send a proper server error status code
        res.status(500).json({ message: "Something went wrong on the server." });
    }
}


const getUserHistory = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token: token });
        const meetings = await Meeting.find({ user_id: user.username })
        res.json(meetings)
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}

const addToHistory = async (req, res) => {
    const { token, meeting_code } = req.body;

    try {
        const user = await User.findOne({ token: token });

        const newMeeting = new Meeting({
            user_id: user.username,
            meetingCode: meeting_code
        })

        await newMeeting.save();

        res.status(httpStatus.CREATED).json({ message: "Added code to history" })
    } catch (e) {
        res.json({ message: `Something went wrong ${e}` })
    }
}


export { login, register, getUserHistory, addToHistory }
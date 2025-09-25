import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("PORT", (process.env.PORT || 8000))
const allowedOrigins = [
  "https://meetly-sricharith.netlify.app",
  "https://meetly-sricharith.onrender.com",
  "http://localhost:3000"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
import dotenv from "dotenv";
dotenv.config();


const start = async () => {
    try {
        const connectionDb = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MONGO Connected: ${connectionDb.connection.host}`);
        console.log("Connected to DB:", connectionDb.connection.name);
        
        server.listen(process.env.PORT, () => {
            console.log(`Server listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};





start();
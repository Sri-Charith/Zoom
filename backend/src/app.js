import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";

import connectToSocket from "./controllers/SocketManager.js";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// Express setup
app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Routes
app.use("/api/v1/users", userRoutes);

// Start server + DB
import dotenv from "dotenv";
dotenv.config();

const start = async () => {
  try {
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
      console.log(`LISTENING ON PORT ${app.get("port")}`);
    });
  } catch (err) {
    console.error("DB Connection Error:", err.message);
    process.exit(1);
  }
};


start();


// Because of Socket.IO.
// Socket.IO works by "attaching" itself to a raw HTTP server, not just Express.
// Express itself is not an HTTP server, it’s just a request handler function.
// So when we do:const server = createServer(app);
// We pass the Express app as the request handler into Node’s HTTP server.
// That way:
// The HTTP server can handle normal API requests through Express (/api/v1/users/...).
// The same HTTP server can also be used by Socket.IO for WebSocket connections
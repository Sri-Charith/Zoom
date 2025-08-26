import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/SocketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://SriCharith:<Charith%402005>@apnavideocall.xqauir0.mongodb.net/")

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => 
      {
        console.log("LISTENIN ON PORT 8000")
      });
}

start();

// Because of Socket.IO.
// Socket.IO works by "attaching" itself to a raw HTTP server, not just Express.
// Express itself is not an HTTP server, it’s just a request handler function.
// So when we do:const server = createServer(app);
// We pass the Express app as the request handler into Node’s HTTP server.
// That way:
// The HTTP server can handle normal API requests through Express (/api/v1/users/...).
// The same HTTP server can also be used by Socket.IO for WebSocket connections
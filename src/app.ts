import express from "express";
import { config } from "dotenv"; // Load environment variables
import "reflect-metadata"; // Required for TypeORM to work with decorators
import http from "http"; // HTTP server for integrating Socket.IO
import { Server } from "socket.io";
import { initDb } from "./config/data-source"; // Database initialization
import router from "./routes"; // Import your routes
import initializeSockets from "./sockets"; // WebSocket logic initialization

// Initialize environment variables
config();

// Create Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes under '/api' endpoint
app.use("/api", router);

// Initialize database
initDb();

// Create the HTTP server from the app
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"], // Optional, depending on your needs
  },
});

// Initialize all WebSocket features (auction logic, etc.)
initializeSockets(io);

// Start the HTTP server (use server.listen, not app.listen)
server.listen(process.env.PORT || 8001, () => {
  console.log(`This app is running on port ${process.env.PORT || 8001}`);
});

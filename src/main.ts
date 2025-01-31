import http from "http";
import { Server } from "socket.io";
import createApp from "./app";
import initializeSockets from "./sockets";
import { AppDataSource } from "./config/data-source";
import SocketIOService from "./services/socketio.service";
import { initializeJobs } from "./jobs"; // Import the job initialization function

// Initialize database connection
AppDataSource.initialize()
  .then(async () => {
    console.log("Database connected");

    // Initialize jobs after the database is connected
    await initializeJobs();
    console.log("All jobs initialized");

    // Create app after jobs initialization
    const app = createApp();

    // Create the HTTP server
    const server = http.createServer(app);

    // Set up Socket.io server
    const io = new Server(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type"],
        credentials: true,
      },
    });

    // Initialize the SocketIO service and sockets
    SocketIOService.getInstance().initialize(io);
    initializeSockets(io);

    // Start the server
    server.listen(process.env.PORT || 8001, () => {
      console.log(`This app is running on port ${process.env.PORT || 8001}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit the process if database connection fails
  });

import express from "express";
import { config } from "dotenv"; // Load environment variables
import "reflect-metadata"; // Required for TypeORM to work with decorators
import { initDb } from "./config/data-source"; // Database initialization
import router from "./routes"; // Import your routes

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

// Global error handling middleware (optional but recommended)
app.use((err: Error, req: express.Request, res: express.Response) => {
  console.error(err.stack); // Log the error stack for debugging purposes
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

// Start server
app.listen(process.env.PORT || 8001, () => {
  console.log(`This app is running on port ${process.env.PORT || 8001}`);
});

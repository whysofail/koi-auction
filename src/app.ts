import express from "express";
import { config } from "dotenv";
import "reflect-metadata";
import morgan from "morgan";
import path from "path";
import cors from "cors";
import router from "./routes";

export default function createApp() {
  config();

  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000", // Frontend origin
      methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
      credentials: true, // If sending cookies or authentication headers
    }),
  );

  morgan.token("reqBody", (req: any) => {
    if (["POST", "PUT"].includes(req.method)) {
      return JSON.stringify(req.body);
    }
    return "";
  });

  morgan.token("auth", (req: any) => req.headers.authorization || "");

  app.use(express.json());
  app.use(
    morgan(":method :url :status :response-time ms Auth::auth Body::reqBody"),
  );
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.use("/api", router);
  return app;
}

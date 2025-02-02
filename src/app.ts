import express from "express";
import { config } from "dotenv";
import "reflect-metadata";
import morgan from "morgan";
import cors from "cors";
import router from "./routes";

export default function createApp() {
  config();

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    cors({
      credentials: true,
      preflightContinue: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      origin: true,
    }),
  );
  app.options("*", cors());
  app.use("/api", router);

  morgan.token("reqBody", (req: any) => {
    if (["POST", "PUT"].includes(req.method)) {
      return JSON.stringify(req.body);
    }

    return "";
  });

  morgan.token("auth", (req: any) => req.headers.authorization || "");
  app.use(
    morgan(":method :url :status :response-time ms Auth::auth Body::reqBody"),
  );

  return app;
}

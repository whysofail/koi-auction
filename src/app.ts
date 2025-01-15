import express from "express";
import { config } from "dotenv";
import "reflect-metadata";
import morgan from "morgan";
import router from "./routes";

export default function createApp() {
  config();

  const app = express();

  app.use(express.json());
  app.use(morgan("common"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(express.json());
  app.use("/api", router);

  return app;
}

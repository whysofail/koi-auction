import express from "express";
import { config } from "dotenv";
import "reflect-metadata";
import { initDb } from "./config/data-source";

const app = express();

config();
initDb();

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(`This app is running on port ${process.env.PORT}`);
});

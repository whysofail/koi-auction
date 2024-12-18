import express from "express";
import { config } from "dotenv";
import "reflect-metadata";
// import { initDb } from "./config/data-source";
import router from "./routes";

const app = express();
app.use("/api", router);

const { APP_ENV } = process.env;
config();
if (APP_ENV !== "production") {
  // initDb();
}

app.listen(process.env.PORT || 8001, () => {
  console.log(`This app is running on port ${process.env.PORT || 8001}`);
});

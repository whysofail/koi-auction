import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Determine if we're in production/compiled mode
const isProduction =
  process.env.NODE_ENV === "production" || __filename.endsWith(".js");

// Set the base directory and file extension based on environment
const baseDir = isProduction ? "dist" : "src";
const fileExtension = isProduction ? ".js" : ".ts";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: true,
  logging: false,
  entities: [
    path.join(process.cwd(), baseDir, "entities", "**", `*${fileExtension}`),
  ],
  migrations: [
    path.join(process.cwd(), baseDir, "migrations", "**", `*${fileExtension}`),
  ],
  subscribers: [
    path.join(process.cwd(), baseDir, "subscribers", "**", `*${fileExtension}`),
  ],
});

const initDb = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export { initDb };

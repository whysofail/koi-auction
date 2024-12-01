/* eslint-disable radix */
import { DataSource } from "typeorm";
import { config } from "dotenv";

config();

const { DB_NAME, DB_PORT, DB_HOST, DB_USERNAME, DB_PASS } = process.env;

const AppDataSource = new DataSource({
  type: "mysql",
  host: DB_HOST,
  port: parseInt(DB_PORT ?? "3306"),
  username: DB_USERNAME,
  password: DB_PASS,
  database: DB_NAME,
  synchronize: true,
  logging: true,
  entities: ["src/entity/*.ts"],
  migrations: ["src/migrations/*.ts"],
});

const initDb = async () => {
  try {
    await AppDataSource.initialize();
  } catch (error) {
    console.error("Error initializing data source", error);
    process.exit(1);
  }
};

export { AppDataSource, initDb };

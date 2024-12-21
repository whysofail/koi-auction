/* eslint-disable radix */
import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
import { runSeeders, SeederOptions } from "typeorm-extension";
import { config } from "dotenv";
import MainSeeder from "./main.seed";

config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASS, DB_NAME } = process.env;

const options: DataSourceOptions & SeederOptions = {
  type: "mysql",
  host: DB_HOST,
  port: parseInt(DB_PORT ?? "3306"),
  username: DB_USERNAME,
  password: DB_PASS,
  database: DB_NAME,
  entities: ["src/entities/*.ts"],
  factories: ["src/seeders/factory/*.ts"],
  seeds: [MainSeeder],
};

const dataSource = new DataSource(options);

const initSeeders = async () => {
  try {
    await dataSource.initialize();
    await dataSource.synchronize(true);
    await runSeeders(dataSource);
    console.log("Database seeded successfully");
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

initSeeders();

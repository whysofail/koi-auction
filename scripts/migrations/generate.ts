import { AppDataSource } from "../../src/config/data-source";

const generateMigration = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const migrationName = process.argv[2] || "InitialMigration";

    await AppDataSource.runMigrations();
    await AppDataSource.destroy();

    console.log("Migration generation complete");
  } catch (error) {
    console.error("Error generating migration:", error);
    process.exit(1);
  }
};

generateMigration().catch(console.error);

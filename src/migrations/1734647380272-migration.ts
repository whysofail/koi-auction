import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734647380272 implements MigrationInterface {
  name = "Migration1734647380272";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`balance\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`balance\``);
  }
}

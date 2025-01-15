import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736845586482 implements MigrationInterface {
  name = "Migration1736845586482";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`title\` varchar(255) NOT NULL DEFAULT 'Auction Title'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`description\` text NOT NULL DEFAULT 'Auction Description'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`description\``,
    );
    await queryRunner.query(`ALTER TABLE \`auction\` DROP COLUMN \`title\``);
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1736843594329 implements MigrationInterface {
  name = "Migration1736843594329";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`title\` varchar(255) NOT NULL DEFAULT 'Auction Title'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`auction\` DROP COLUMN \`title\``);
  }
}

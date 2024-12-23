import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734937161780 implements MigrationInterface {
  name = "Migration1734937161780";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`auction\` DROP COLUMN \`end_time\``);
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`start_time\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`start_datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`end_datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`reserve_price\` decimal(10,2) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` CHANGE \`current_highest_bid\` \`current_highest_bid\` decimal(10,2) NOT NULL DEFAULT '0.00'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction\` CHANGE \`current_highest_bid\` \`current_highest_bid\` decimal(10,0) NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`updated_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`created_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`reserve_price\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`end_datetime\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP COLUMN \`start_datetime\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`start_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD \`end_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
  }
}

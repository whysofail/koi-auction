import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734333592911 implements MigrationInterface {
  name = "Migration1734333592911";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`bid\` (\`bid_id\` varchar(36) NOT NULL, \`bid_amount\` decimal NOT NULL, \`bid_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, \`auction_id\` varchar(36) NULL, PRIMARY KEY (\`bid_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`item\` (\`item_id\` varchar(36) NOT NULL, \`item_name\` varchar(255) NOT NULL, \`item_description\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, \`starting_price\` decimal NOT NULL, \`reserve_price\` decimal NOT NULL, \`condition\` varchar(255) NOT NULL DEFAULT 'new', \`seller_id\` varchar(36) NULL, PRIMARY KEY (\`item_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`user_id\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`registration_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`last_update\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auction\` (\`auction_id\` varchar(36) NOT NULL, \`start_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`end_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`status\` enum ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'PENDING', \`current_highest_bid\` decimal NOT NULL DEFAULT '0', \`item_id\` varchar(36) NULL, \`created_by_id\` varchar(36) NULL, UNIQUE INDEX \`REL_27c3c60778327d48b589190ab2\` (\`item_id\`), PRIMARY KEY (\`auction_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` ADD CONSTRAINT \`FK_2abdf07c084ae99935e6506d06e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` ADD CONSTRAINT \`FK_9e594e5a61c0f3cb25679f6ba8d\` FOREIGN KEY (\`auction_id\`) REFERENCES \`auction\`(\`auction_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD CONSTRAINT \`FK_fdba209b8f8b24706b3f69fa0f5\` FOREIGN KEY (\`seller_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD CONSTRAINT \`FK_27c3c60778327d48b589190ab20\` FOREIGN KEY (\`item_id\`) REFERENCES \`item\`(\`item_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD CONSTRAINT \`FK_d6d1d5a66a4721b9b1a259557c6\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP FOREIGN KEY \`FK_d6d1d5a66a4721b9b1a259557c6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP FOREIGN KEY \`FK_27c3c60778327d48b589190ab20\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_fdba209b8f8b24706b3f69fa0f5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` DROP FOREIGN KEY \`FK_9e594e5a61c0f3cb25679f6ba8d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` DROP FOREIGN KEY \`FK_2abdf07c084ae99935e6506d06e\``,
    );
    await queryRunner.query(
      `DROP INDEX \`REL_27c3c60778327d48b589190ab2\` ON \`auction\``,
    );
    await queryRunner.query(`DROP TABLE \`auction\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`item\``);
    await queryRunner.query(`DROP TABLE \`bid\``);
  }
}

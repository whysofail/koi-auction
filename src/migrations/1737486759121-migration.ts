import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1737486759121 implements MigrationInterface {
  name = "Migration1737486759121";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`item\` (\`item_id\` varchar(36) NOT NULL, \`item_name\` varchar(255) NOT NULL, \`item_description\` varchar(255) NOT NULL, \`category\` varchar(255) NOT NULL, \`starting_price\` decimal NOT NULL, \`reserve_price\` decimal NOT NULL, \`condition\` varchar(255) NOT NULL DEFAULT 'new', \`seller_id\` varchar(36) NULL, PRIMARY KEY (\`item_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`bid\` (\`bid_id\` varchar(36) NOT NULL, \`bid_amount\` decimal NOT NULL, \`bid_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user_id\` varchar(36) NULL, \`auction_id\` varchar(36) NULL, PRIMARY KEY (\`bid_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auction_participant\` (\`auction_participant_id\` varchar(36) NOT NULL, \`joined_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`auction_id\` varchar(36) NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`auction_participant_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`auction\` (\`auction_id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL DEFAULT 'Auction Title', \`description\` text NOT NULL, \`start_datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`end_datetime\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`status\` enum ('DRAFT', 'PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'FAILED') NOT NULL DEFAULT 'PENDING', \`current_highest_bid\` decimal(10,2) NOT NULL DEFAULT '0.00', \`reserve_price\` decimal(10,2) NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`item_id\` varchar(36) NULL, \`created_by_id\` varchar(36) NULL, UNIQUE INDEX \`REL_27c3c60778327d48b589190ab2\` (\`item_id\`), PRIMARY KEY (\`auction_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`transaction\` (\`transaction_id\` varchar(36) NOT NULL, \`admin_id\` varchar(255) NULL, \`amount\` decimal(12,2) NOT NULL, \`type\` enum ('deposit', 'withdrawal', 'transfer', 'participate') NOT NULL, \`status\` enum ('pending', 'completed', 'failed', 'approved', 'rejected') NOT NULL DEFAULT 'pending', \`proof_of_payment\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`wallet_id\` varchar(36) NULL, PRIMARY KEY (\`transaction_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`wallet\` (\`wallet_id\` varchar(36) NOT NULL, \`user_id\` varchar(255) NOT NULL, \`balance\` decimal(12,2) NOT NULL DEFAULT '0.00', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`REL_72548a47ac4a996cd254b08252\` (\`user_id\`), PRIMARY KEY (\`wallet_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`refresh_token\` (\`token_id\` varchar(36) NOT NULL, \`token\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expires_at\` datetime NOT NULL, \`is_revoked\` tinyint NOT NULL DEFAULT 0, \`userUserId\` varchar(36) NULL, PRIMARY KEY (\`token_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`notification_id\` varchar(36) NOT NULL, \`type\` enum ('BID', 'AUCTION', 'SYSTEM') NOT NULL, \`message\` text NULL, \`reference_id\` varchar(255) NULL, \`status\` enum ('PENDING', 'READ', 'ARCHIVED') NOT NULL DEFAULT 'PENDING', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime NULL, \`user_id\` varchar(36) NULL, PRIMARY KEY (\`notification_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`user_id\` varchar(36) NOT NULL, \`username\` varchar(255) NOT NULL, \`role\` enum ('admin', 'user') NOT NULL DEFAULT 'user', \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`registration_date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`last_update\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` ADD CONSTRAINT \`FK_fdba209b8f8b24706b3f69fa0f5\` FOREIGN KEY (\`seller_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` ADD CONSTRAINT \`FK_2abdf07c084ae99935e6506d06e\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` ADD CONSTRAINT \`FK_9e594e5a61c0f3cb25679f6ba8d\` FOREIGN KEY (\`auction_id\`) REFERENCES \`auction\`(\`auction_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` ADD CONSTRAINT \`FK_9d4335b4fc0e2e7867a4dc902e0\` FOREIGN KEY (\`auction_id\`) REFERENCES \`auction\`(\`auction_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` ADD CONSTRAINT \`FK_959b52f79270decf318a585147b\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD CONSTRAINT \`FK_27c3c60778327d48b589190ab20\` FOREIGN KEY (\`item_id\`) REFERENCES \`item\`(\`item_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` ADD CONSTRAINT \`FK_d6d1d5a66a4721b9b1a259557c6\` FOREIGN KEY (\`created_by_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_08081d10759ec250c557cebd81a\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallet\`(\`wallet_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_9ebef6fe1344f83ea266c0914c1\` FOREIGN KEY (\`admin_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_72548a47ac4a996cd254b082522\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` ADD CONSTRAINT \`FK_e45ab0495d24a774bd49731b7a5\` FOREIGN KEY (\`userUserId\`) REFERENCES \`user\`(\`user_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_928b7aa1754e08e1ed7052cb9d8\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`user_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_928b7aa1754e08e1ed7052cb9d8\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`refresh_token\` DROP FOREIGN KEY \`FK_e45ab0495d24a774bd49731b7a5\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_72548a47ac4a996cd254b082522\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_9ebef6fe1344f83ea266c0914c1\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_08081d10759ec250c557cebd81a\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP FOREIGN KEY \`FK_d6d1d5a66a4721b9b1a259557c6\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction\` DROP FOREIGN KEY \`FK_27c3c60778327d48b589190ab20\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` DROP FOREIGN KEY \`FK_959b52f79270decf318a585147b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`auction_participant\` DROP FOREIGN KEY \`FK_9d4335b4fc0e2e7867a4dc902e0\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` DROP FOREIGN KEY \`FK_9e594e5a61c0f3cb25679f6ba8d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`bid\` DROP FOREIGN KEY \`FK_2abdf07c084ae99935e6506d06e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`item\` DROP FOREIGN KEY \`FK_fdba209b8f8b24706b3f69fa0f5\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`notification\``);
    await queryRunner.query(`DROP TABLE \`refresh_token\``);
    await queryRunner.query(
      `DROP INDEX \`REL_72548a47ac4a996cd254b08252\` ON \`wallet\``,
    );
    await queryRunner.query(`DROP TABLE \`wallet\``);
    await queryRunner.query(`DROP TABLE \`transaction\``);
    await queryRunner.query(
      `DROP INDEX \`REL_27c3c60778327d48b589190ab2\` ON \`auction\``,
    );
    await queryRunner.query(`DROP TABLE \`auction\``);
    await queryRunner.query(`DROP TABLE \`auction_participant\``);
    await queryRunner.query(`DROP TABLE \`bid\``);
    await queryRunner.query(`DROP TABLE \`item\``);
  }
}
